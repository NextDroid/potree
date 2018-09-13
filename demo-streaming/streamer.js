
var activeDataLoaderTask;
var workerID = 0;
startHeartbeat();


function startHeartbeat() {
  // Start Heartbeat:
  var timer = new Worker('timer.js');
  timer.onmessage = function(e) {
    try {
      activeDataLoaderTask.worker.postMessage({
        msg: "heartbeat",
        // timeVal: ($("#myRange").val()/rtkRange/100.0 + rtkOffset - header.tmin)/(header.tmax - header.tmin)*header.filesize
      });
    } catch (e) {
      // console.log(e);
    }
  }
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
    // console.log("header var: ", header);
    var event = new Event("header-received");
    event.data = header;
    window.dispatchEvent(event);
  });
}


function streamFromTime(timeVal, header, settings) { // NOTE: 0.0 <= timeVal < 1.0

  console.log("Streaming from time: ", timeVal);

  // Compute Number of Bytes per Point:
  var bytesPerPoint = 0;
  try {
    console.assert(header.counts.length == header.sizes.length);
    for (let ii=0; ii<header.counts.length; ii++) {
      bytesPerPoint += header.counts[ii] * header.sizes[ii];
    }
  } catch (exception) {
    console.log(exception);
    console.log(header);
    bytesPerPoint = header.sizes.reduce((a,b) => a+b, 0);
  }
  console.log("Points Total Size: ", bytesPerPoint, " bytes");

  // Compute Seek Position:
  var seekPosBytes = Math.floor(timeVal * header.numpoints)*bytesPerPoint;

  // Stop Previous Data Loader Task (if exists):
  try {
    activeDataLoaderTask.worker.postMessage({msg: "terminate"});
  } catch (e) {
    console.log("no previous task: ", e);
  }

  // Create Data Loader Task:
  activeDataLoaderTask = {
    worker: new Worker('data-loader.js'),		// Create a new worker thread
    workerID: workerID,
    msg: "fetch",
    serverUrl: settings.serverUrl,
    port: settings.port,
    filename: settings.filename,
    filesize: header.filesize,
    seekPosBytes: seekPosBytes,
    bytesPerPoint: bytesPerPoint,
    header: header,
    maxMemMB: settings.maxMemMB,
    offsets: {                       // NOTE Hardcoded
      x: 0,
      y: 8,
      z: 16,
      i: 24,
      t: 32
    }
  }

  // Launch Data Loader Worker Thread:
  var flattenedTask = JSON.parse(JSON.stringify(activeDataLoaderTask));
  activeDataLoaderTask.worker.postMessage(flattenedTask);
  activeDataLoaderTask.worker.onmessage = handleDataLoaderMessage;
}


function handleDataLoaderMessage(response) {

  console.log("received message from data loader: ", response.data);

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
      console.log("heartbeat: ", response.data);
      heartbeat = response.data;

      // //TODO remove
      // activeDataLoaderTask.worker.postMessage({
      //   msg: "slice",
      //   tmin: heartbeat.tmin,
      //   tmax: heartbeat.tmin+10
      // });

      // TODO do something with heartbeat
      // Save TBmin, TBmax, numPoints, memSize
      break;

    default:
      console.log("Unknown message type received: ", response.data.msg);
  }
}
