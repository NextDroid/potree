self.importScripts("bower_components/cbuffer/cbuffer.js", "bufferFunctions.js");

// Data Loader Member Variables:
self.tLifeStart = performance.now();
self.tReadStart;
self.task;
self.Bbuffers;
self.maxNumPoints;
self.prevBuffer = new Uint8Array(0);
self.totalBytesRead = 0;
self.streamReader;
self.playbarTimeVal;

console.log("Data Loader Created!");


self.onmessage = handleInputMessage;
function handleInputMessage(e) {

  if (e.data.msg == "fetch") {

    // Parse task:
    self.task = e.data;
    var url = task.serverUrl + ":" + task.port + "/args/data/" + task.filename; // TODO fix this
    var seekPosBytes = e.data.seekPosBytes;
    self.playbarTimeVal = seekPosBytes;

    // Create fetch headers:
    var fetchHeaders = new Headers();
    fetchHeaders.append("X-Seek-Position", seekPosBytes);
    var myInit = {headers: fetchHeaders};
    console.log("worker received: ", myInit.headers.get("x-seek-position"));

    // Compute max number of points:
    self.maxNumPoints = task.maxMemMB/task.bytesPerPoint*1e6;

    // Send fetch request:
    fetch(url, myInit)
    .then((res) => handleFetchResponse(res))
    .catch((err) => console.log("Worker Fetch Error: ", err));

  } else if (e.data.msg == "slice") {

    // Slice Bbuffers:
    var tmin = e.data.tmin;
    var tmax = e.data.tmax;
    slice(tmin, tmax);

  } else if (e.data.msg == "heartbeat") {

    // Send Heartbeat update:
    e.data.timeVal = self.playbarTimeVal
    sendHeartbeat();

  } else if (e.data.msg == "terminate") {

    // Close Data Loader:
    terminate();
  }
}

function handleFetchResponse(response, readUntil=-1) {

    // Create SecondaryBuffers:
    self.Bbuffers = {
      pos: new CBuffer(3*self.maxNumPoints),
      i: new CBuffer(1*self.maxNumPoints),
      t: new CBuffer(1*self.maxNumPoints)
    }

    var stream = response.body;
    var reader = stream.getReader();
    if ( typeof(reader) != "undefined") {
      tReadStart = performance.now();
      self.streamReader = reader;
      pump();
    }
}

function pump() {
  self.streamReader.read().then((e) => {

    // Check if reached end of file:
    if (e.done) {
      // terminate();
    } else {

      // Append stream data into Bbuffers:
      // var buffer = concatTypedArrays(prevBuffer, e.value); // TODO assumption is that e.value is Uint8Array
      var buffer = e.value;
      var view = new DataView(buffer.buffer);
      var bytesRead = 0;
      for (let ii=0; ii < (buffer.length-task.bytesPerPoint); ii+=task.bytesPerPoint) {

        self.Bbuffers.pos.push(view.getFloat64(ii+task.offsets.x, true) + task.header.x0);
        self.Bbuffers.pos.push(view.getFloat64(ii+task.offsets.y, true) + task.header.y0);
        self.Bbuffers.pos.push(view.getFloat64(ii+task.offsets.z, true) + task.header.z0);

        self.Bbuffers.i.push(view.getFloat64(ii+task.offsets.i, true));

        self.Bbuffers.t.push(view.getFloat64(ii+task.offsets.t, true)); // TODO use offset??

        if (self.Bbuffers.t.data[self.Bbuffers.t.start] > self.playbarTimeVal) {
          slice(self.Bbuffers.t.data[self.Bbuffers.t.start], self.Bbuffers.t.data[self.Bbuffers.t.end]);
          return;
        }

        bytesRead += task.bytesPerPoint;
      }

      self.totalBytesRead += bytesRead;
      prevBuffer = buffer.slice(bytesRead, buffer.length);

      // Pump again:
      pump();
    }
  });
}


function slice(tmin, tmax) {

  tslicestart = performance.now();

  // Find minIdx:
  var minIdx = self.Bbuffers.t.toArray().findIndex((x) => (x >= tmin));
  if (minIdx == -1) {
    console.log("ERROR!! INVALID TMIN: ", tmin);
    debugger;
    minIdx = 0;
  } else {
    // TODO try picking closest of either mindIdx or minIdx-1
  }

  // Find maxIdx:
  var maxIdx = self.Bbuffers.t.slice(minIdx, self.Bbuffers.t.length).reverse().findIndex((x) => (x < tmax));
  maxIdx = (self.Bbuffers.t.length-1) - maxIdx; // correct for reversed array
  if (maxIdx == self.Bbuffers.t.length) {
    console.log("ERROR!! INVALID TMAX: ", tmax);
    maxIdx = self.Bbuffers.t.length-1;
  } else {
    // TODO try picking closest of either maxIdx or maxIdx+1
  }
  // debugger; // check minIdx and maxIdx

  // Execute Slices:
  var posSlice = Float32Array.from(self.Bbuffers.pos.slice(3*minIdx, 3*maxIdx));
  var iSlice = Float32Array.from(self.Bbuffers.i.slice(minIdx, maxIdx));
  var tSlice = Float32Array.from(self.Bbuffers.t.slice(minIdx, maxIdx));

  // Transfer Slices to main:
  var transferObj = {
    msg: "slice",
    pos: posSlice,
    i: iSlice,
    t: tSlice,
    numPoints: tSlice.length  // TODO check this value
  }

  self.postMessage(transferObj, [posSlice.buffer, iSlice.buffer, tSlice.buffer]);

  dtSliceMillis = performance.now() - tslicestart;
  console.log("Slice Time: ", (dtSliceMillis/1000), " seconds");
}

function sendHeartbeat() {

  try {
    // Send status update:
    self.postMessage({
      msg: "heartbeat",
      tmin: self.Bbuffers.t.data[self.Bbuffers.t.start],
      tmax: self.Bbuffers.t.data[self.Bbuffers.t.end],
      numPoints: self.Bbuffers.t.length,
      bytesRead: self.totalBytesRead
    });
  } catch (e) {
    console.log("Failed to send heartbeat: ", e);
  }
}

function terminate() {

  // Close Stream Reader if exists:
  if (typeof(self.streamReader) != "undefined") {
    self.streamReader.cancel();
    self.streamReader.releaseLock();
  }

  // TODO Transfer ownership of Bbuffers??

  // Compute Performance Statistics:
  var tfinal = performance.now()
  var dtLifetimeMillis = tfinal - tLifeStart;
  var dtReadtimeMillis = tfinal - tReadStart;
  console.log("terminating worker \n -- readtime: ", (dtReadtimeMillis/1000), "seconds \n -- lifetime: ", (dtLifetimeMillis/1000), " seconds");

  // Close Data Loader:
  self.close();
}
