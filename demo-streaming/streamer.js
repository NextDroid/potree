
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
        time = $("#myRange").val()/100*rtkRange + rtkOffset - header.tmin
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
  streamFromTimeNew(0, {offset:header.tmin, range:(header.tmax-header.tmin)}, header, settings);
}

function streamFromTimeNew(playbarVal, rtkTime, header, settings) { // NOTE: 0.0 <= playbarVal < 1.0

  console.log("Streaming from playbar value: ", playbarVal);

  // Compute lidarTime from playbarVal and rtkTime:
  lidarTime = playbarVal*rtkTime.range + rtkTime.offset - header.tmin;
  // debugger;

  // Bounds check lidarTime:
  if ((lidarTime < 0.0) || (lidarTime > (header.tmax - header.tmin))) {
    debugger;
    console.log("No points exist within point cloud at specified time");

  } else {
    // Stop Previous Stream:
    DataLoader.postMessage({msg: "stop"});

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
        y: 8,
        z: 16,
        i: 24,
        t: 32
      }
    }

    // Launch Data Loader Worker Thread:
    DataLoader.postMessage({msg: "restart", task:activeDataLoaderTask});
    DataLoader.onmessage = handleDataLoaderMessage;
  }
}

function requestSlice(tmin=-1, tmax=-1) {

  try {

    if (tmin == -1) {
      tmin = heartbeat.tmin;
    }
    if (tmax == -1) {
      tmax = heartbeat.tmax;
    }

    DataLoader.postMessage({
      msg: "slice",
      tmin: tmin,
      tmax: tmax
    })
  } catch (e) {
    console.log(e);
  }
}


function handleDataLoaderMessage(response) {

  // console.log("received message from data loader: ", response.data
  // debugger; // check response structure

  switch (response.data.msg) {

    case "slice":
      console.log("Slice: ", response.data);
      slice = response.data;

      if (typeof(cloudMesh) != "undefined") {
        var positionAttributes = new THREE.BufferAttribute(slice.pos, 3);
        var intensityAttributes = new THREE.BufferAttribute(slice.i, 1);
        var timeAttributes = new THREE.BufferAttribute(slice.t, 1);
        // debugger; // check attributes above

        cloudMesh.geometry.addAttribute("position", positionAttributes);
        cloudMesh.geometry.addAttribute("intensity", intensityAttributes);
        cloudMesh.geometry.addAttribute("gpsTime", timeAttributes);
        cloudMesh.geometry.computeBoundingSphere();

        // viewer.scene.view.lookAt(cloudMesh.geometry.boundingSphere.center);

      }
      break;

    case "heartbeat":
      console.log("heartbeat: ", response.data, "\nstate: ", response.data.state);
      heartbeat = response.data;

      // TODO do something with heartbeat
      // Save TBmin, TBmax, numPoints, memSize
      break;

    case "runState":
      // Send the message back:
      DataLoader.postMessage({msg:"runState"});
      break;

      case "request-slice":
      //Request slice from DataLoader:
      var time = 0;
      if (rtkRange != null || rtkOffset != null) {
        time = $("#myRange").val()/100*rtkRange + rtkOffset - header.tmin
      }
      requestSlice(time, time+settings.TA);
      break;

    default:
      console.log("Unknown message type received: ", response.data.msg);
  }
}
