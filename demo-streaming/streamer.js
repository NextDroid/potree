
var activeDataLoaderTask;
var workerID = 0;
startHeartbeat();

function startHeartbeat() {
  // Start Heartbeat:
  var timer = new Worker('timer.js');
  timer.onmessage = function(e) {
    try {
      activeDataLoaderTask.worker.postMessage({msg: "heartbeat"});
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
  // NOTE removed numBytesToRead

  // Create Data Loader Task:
  activeDataLoaderTask = {
    worker: new Worker('data-loader.js'),		// Create a new worker thread
    workerID: workerID,
    msg: "fetch",
    serverUrl: settings.serverUrl,  // TODO moved to settings
    port: settings.port,            // TODO moved to settings
    filename: settings.filename,    // TODO moved to settings
    filesize: header.filesize,
    seekPosBytes: seekPosBytes,
    bytesPerPoint: bytesPerPoint,
    header: header,
    maxMemMB: settings.maxMemMB,     // TODO moved to settings
    offsets: {                       // NOTE Hardcoded
      x: 0,
      y: 8,
      z: 16,
      i: 24,
      t: 32
    }
    // NOTE removed numBytesToRead
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
      // TODO do something with Slice
      // create new Float32BufferAttributes
      // cloudMesh.geometry.addAttributes(...) --> for each attribute
      break;

    case "heartbeat":
      console.log("heartbeat: ", response.data);

      // TODO REMOVE
      activeDataLoaderTask.worker.postMessage({
        msg: "slice",
        tmin: response.data.tmin,
        tmax: response.data.tmin+10
      });

      // TODO do something with heartbeat
      // Save TBmin, TBmax, numPoints, memSize
      break;

    default:
      console.log("Unknown message type received: ", response.data.msg);
  }


}
