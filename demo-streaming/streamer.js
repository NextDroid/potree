
var activeDataLoaderTask;
var DataLoader;
var workerID = 0;
startHeartbeat();
startDataLoader();

function startHeartbeat() {
  // Start Heartbeat:
  var timer = new Worker('timer.js');
  timer.onmessage = function(e) {

    DataLoader.postMessage({
      msg: "heartbeat"
    });

    try {
      var time = 0;
      if (rtkRange != null || rtkOffset != null) {
        time = $("#myRange").val()/100*rtkRange + rtkOffset - header.tmin;
      }
      DataLoader.postMessage({
        msg: "lidarTime",
        time: time
      });
    } catch (e) {
      console.log(e);
    }
  }
}

function startDataLoader() {

  // Start DataLoader:
  DataLoader = new Worker("data-loader.js");
  DataLoader.onmessage = handleDataLoaderMessage; // Assign callback function

}

function sendHeaderRequest(url, headerReceivedCallback) {
  //Send fetch request for header:
  fetch(url).then((response) => handleHeaderResponse(response));

  // Wait for fetch to return then trigger callback once header is received:
  window.addEventListener("header-received", (e) => headerReceivedCallback(e));
}

function handleHeaderResponse(response) {
  console.log("Parsing header response: ", response);

  // Extract header text from response
  var text = response.text();
  text.then((data) => {
    console.log("header text: ", data.split('\n'));

    // Parse header:
    var header = {};
    for (let fieldStr of data.split('\n')) {
      if(fieldStr.includes("X0")) {
        header.x0 = parseFloat(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("Y0")) {
        header.y0 = parseFloat(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("Z0")) {
        header.z0 = parseFloat(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("TMIN")) {
        header.tmin = parseFloat(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("TMAX")) {
        header.tmax = parseFloat(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("FILESIZE")) {
        header.filesize = parseInt(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("POINTS")) {
        header.numpoints = parseInt(fieldStr.split(" ")[1]);
      } else if (fieldStr.includes("SIZE")) {
        var sizes = fieldStr.split(' ').map(Number);
        header.sizes = sizes.slice(1, sizes.length);
      } else if (fieldStr.includes("COUNT")) {
        var counts = fieldStr.split(" ").map(Number);
        header.counts = counts.slice(1, counts.length);
      }
    }

    // Post Message -- send out parsed header properties
    // using dispatchEvent
    var event = new Event("header-received");
    event.data = header;
    window.dispatchEvent(event);
  });
}

function computeSeekPosBytes(playbarVal, rtkTime, header, settings) {

  var seekPosBytes = -1;

  // Compute lidarTime from playbarVal and rtkTime:
  lidarTime = playbarVal*rtkTime.range + rtkTime.offset - header.tmin;

  try {

    // Compute Number of Bytes per Point:
    var bytesPerPoint = 0;
    try {
      console.assert(header.counts.length == header.sizes.length);
      for (let ii=0; ii<header.counts.length; ii++) {
        bytesPerPoint += header.counts[ii] * header.sizes[ii];
      }
    } catch (exception) {
      console.log(exception);
      bytesPerPoint = header.sizes.reduce((a,b) => a+b, 0);
    }
    console.log("Points Total Size: ", bytesPerPoint, " bytes");

    // Compute Seek Position:
    var timeVal = lidarTime/(header.tmax-header.tmin);
    seekPosBytes = Math.floor(timeVal * header.numpoints)*bytesPerPoint;

  } catch (e) {
    console.log(e);
  }

  return seekPosBytes;
}

function streamFromFileStart(header, settings) {
  window.openStreamRequest = {expiraryMillis: -1};
  streamFromTimeNew(0, {offset:header.tmin, range:(header.tmax-header.tmin)}, header, settings);
}

function streamFromTimeNew(playbarVal, rtkTime, header, settings) { // NOTE: 0.0 <= playbarVal < 1.0

  if (window.openStreamRequest.expiraryMillis < performance.now()) {  // Must wait until previous open request expires
    console.log("Streaming from playbar value: ", playbarVal);

    // Compute lidarTime from playbarVal and rtkTime:
    lidarTime = playbarVal*rtkTime.range + rtkTime.offset - header.tmin;
    // debugger;

    // Bounds check lidarTime:
    if ((lidarTime < 0.0) || (lidarTime > (header.tmax - header.tmin))) {
      console.log("No points exist within point cloud at specified time");

    } else {
      // Stop Previous Stream:
      DataLoader.postMessage({msg: "stop"});
      DataLoader.postMessage({msg: "send-slice-request-request"});

      // Compute Number of Bytes per Point:
      var bytesPerPoint = 0;
      try {
        console.assert(header.counts.length == header.sizes.length);
        for (let ii=0; ii<header.counts.length; ii++) {
          bytesPerPoint += header.counts[ii] * header.sizes[ii];
        }
      } catch (exception) {
        console.log(exception);
        bytesPerPoint = header.sizes.reduce((a,b) => a+b, 0);
      }
      console.log("Points Total Size: ", bytesPerPoint, " bytes");

      // Compute Seek Position:
      var timeVal = lidarTime/(header.tmax-header.tmin);
      var seekPosBytes = Math.floor(timeVal * header.numpoints)*bytesPerPoint;
      // debugger;

      // Create Data Loader Task:
      activeDataLoaderTask = {
        serverUrl: settings.serverUrl,
        port: settings.port,
        filename: settings.filename,
        filesize: header.filesize,
        seekPosBytes: seekPosBytes,
        bytesPerPoint: bytesPerPoint,
        header: header,
        maxMemMB: settings.maxMemMB,
        bufferEpsilonSec: settings.bufferEpsilonSec,
        offsets: {                       // NOTE Hardcoded
          x: 0,
          y: header.sizes[0],
          z: header.sizes[0]+header.sizes[1],
          i: header.sizes[0]+header.sizes[1]+header.sizes[2],
          t: header.sizes[0]+header.sizes[1]+header.sizes[2]+header.sizes[3]
        }
      }

      // Launch Data Loader Worker Thread:
      DataLoader.postMessage({msg: "restart", task:activeDataLoaderTask});
      DataLoader.onmessage = handleDataLoaderMessage;
      window.openStreamRequest = {
        expiraryMillis: performance.now() + 1000.0 // open request will expire at least 1 second into the future
      }
    }
  }
}

function requestSlice(tmin=-1, tmax=-1) {

  if (!window.openSliceRequest) {
    try {

      if (tmin == -1) { tmin = heartbeat.tmin; }
      if (tmax == -1) { tmax = heartbeat.tmax; }

      DataLoader.postMessage({
        msg: "slice",
        tmin: tmin,
        tmax: tmax
      });
      window.openSliceRequest = true;
    } catch (e) {
      console.log(e);
    }
  }
}


function handleDataLoaderMessage(response) {

  // console.log("received message from data loader: ", response.data
  // debugger; // check response structure

  switch (response.data.msg) {

    case "slice":
    // debugger;// start slice
    tStartAddAttr = performance.now();
      console.log("Slice: ", response.data);
      slice = response.data;

      if (typeof(cloudMesh) != "undefined") {
        var positionAttributes = new THREE.BufferAttribute(slice.pos, 3);
        var intensityAttributes = new THREE.BufferAttribute(slice.i, 1);
        var timeAttributes = new THREE.BufferAttribute(slice.t, 1);

        // // TODO add rtkPosition and rtkOrientation attributes:
        // var rtkPositions = new Float32Array(3*slice.numPoints);
        // var rtkOrientations  = new Float32Array(3*slice.numPoints);
        // var t_lidar, t_rtk, idx, rtkState;
        // for (let ii=0, len=slice.numPoints; ii<len; ii++) {
        //   t_lidar = slice.t[ii];
        //   t_rtk = t_lidar + header.tmin - rtkOffset;
        //   idx = Math.round(t_rtk*100);
        //   rtkState = rtkLookup[idx];
        //
        //   // Note: jj is offset along each row (e.g. x,y,z)
        //   for (let jj=0; jj<3; jj++) {
        //     rtkPositions[3*ii+jj] = rtkState.position[jj];
        //     rtkOrientations[3*ii+jj] = rtkState.orientation[jj];
        //   }
        // }


        // var t;
        // var rtkPositions = new Float32Array(3*slice.numPoints);
        // var rtkOrientations = new Float32Array(3*slice.numPoints);
        // for (let ii=0, len=slice.numPoints; ii<len; ii++) {
        //     t = slice.t[ii];
        //     // TODO convert from lidarTime to rtkTime to playerTime:
        //     playerTime = (t+header.tmin-rtkOffset)/rtkRange;
        //     rtkPosition = animation.getPoint(playerTime);
        //     rtkOrientation = viewer.scene.scene.getObjectByName("bunny").orientationPath.getPoint(playerTime);
        //
        //     rtkPositions[ii+0] = rtkPosition.x;
        //     rtkPositions[ii+1] = rtkPosition.y;
        //     rtkPositions[ii+2] = rtkPosition.z;
        //     rtkOrientations[ii+0] = rtkOrientation.x;
        //     rtkOrientations[ii+1] = rtkOrientation.y;
        //     rtkOrientations[ii+2] = rtkOrientation.z
        // }
        // debugger; // check below
        var rtkPositionAttributes = new THREE.BufferAttribute(slice.rtkPos, 3);
        var rtkOrientationAttributes = new THREE.BufferAttribute(slice.rtkOrient, 3);
        // // debugger; // check attributes above

        cloudMesh.geometry.addAttribute("position", positionAttributes);
        cloudMesh.geometry.addAttribute("intensity", intensityAttributes);
        cloudMesh.geometry.addAttribute("gpsTime", timeAttributes);
        cloudMesh.geometry.addAttribute("originalRtkPosition", rtkPositionAttributes);
        cloudMesh.geometry.addAttribute("originalRtkOrientation", rtkOrientationAttributes);
        // debugger; // check attributes;
        cloudMesh.geometry.computeBoundingSphere();
      }
      tEndAddAttr = performance.now();
      dtAddAttrMillis = tEndAddAttr - tStartAddAttr;

      if (typeof(window.firstSliceRequested) != "undefined" && window.firstSliceRequested) {
        startVisualization();
        window.numSlices = 1;
        window.sliceTimeMillis = slice.sliceTimeMillis+dtAddAttrMillis;
      } else {
        window.sliceTimeMillis = (window.sliceTimeMillis*window.numSlices+(slice.sliceTimeMillis+dtAddAttrMillis))/(window.numSlices+1);
        window.numSlices++;
      }
      console.log("Slice Time (ms): ", window.sliceTimeMillis);
      window.openSliceRequest = false;
      break;



    case "heartbeat":
      console.log("heartbeat: ", response.data, "\nstate: ", response.data.state);
      heartbeat = response.data;

      window.pauseTimeChanged = (window.lastPauseTime != heartbeat.pauseTime);

      // Update loading bar if paused (see DataLoader's LoadingStates for enum val)
      if (window.loadingScreenUp) {
        if (heartbeat.numPoints != heartbeat.totalNumPoints) {
          loadingBar.set(100*heartbeat.numPoints/heartbeat.totalNumPoints);
        } else if (window.pauseTimeChanged) {
          var loadingBarValue = 100*(1-(heartbeat.lidarTime - heartbeat.tmin)/(heartbeat.lidarTime - heartbeat.pauseTime));
          loadingBar.set(loadingBarValue);
        }
      } else {
        loadingBar.set(0);
      }

      // TODO do something with heartbeat
      // Save TBmin, TBmax, numPoints, memSize
      break;

    case "runState":
      // Send the message back:
      DataLoader.postMessage({msg:"runState"});
      break;

    case "request-first-slice":
      //Request slice from DataLoader:
      var time = 0;
      if (rtkRange != null || rtkOffset != null) {
        time = $("#myRange").val()/100*rtkRange + rtkOffset - header.tmin
      }
      requestSlice(time, time+settings.TA);
      window.firstSliceRequested = true;
      window.openSliceRequest = true;
      break;

    case "reached-end-of-file":
      // TODO think about what to do when entire stream is finished playing too
      try {
        var time = 0;
        if (rtkRange != null || rtkOffset != null) {
          time = $("#myRange").val()/100*rtkRange + rtkOffset - header.tmin
        }
        let maxGpsTime = cloudMesh.geometry.attributes.gpsTime.array[cloud.geometry.attributes.gpsTime.length-1];
        if (time > maxGpsTime) {
          // TODO stop streaming
          animation.pause();
          $("#pausebutton").click();
          window.animationPaused = true;
          DataLoader.postMessage({msg:"stop"});
          // debugger;
        }
      } catch (e) {
        console.error("Reached end of file, but error: ", e);
      }
      // TODO using fall through -- refactor this

    case "dataloader-full":

      // if animation is waiting on dataloader --> restart now
      // TODO might break...what happens if call resume when already playing

      if (typeof(window.animationPaused) != "undefined" && window.animationPaused) {
        animation.resume();
        $("#playbutton").mousedown();
        window.animationPaused = false;
        removeLoadingScreen();
        // debugger; // click playbutton
      }
    break;

    default:
      console.log("Unknown message type received: ", response.data.msg);
  }
}

function startVisualization() {
  window.firstSliceRequested = false;

  // Start Animation:
  animation.resume();
  $("#playbutton").mousedown(); // Toggle playbutton

  camPoint = new THREE.Vector3(3.356, -11.906, 3.126);
  viewer.scene.view.position.copy(camPoint); // changed from camera
  var targetPosition = new THREE.Vector3(0, 0, 0);
  viewer.scene.view.lookAt(targetPosition);
  removeLoadingScreen();
}
