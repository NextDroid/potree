self.importScripts("bower_components/cbuffer/cbuffer.js", "bufferFunctions.js");

// Data Loader Member Variables:
self.tLifeStart = performance.now();
self.tReadStart;
self.settings;
self.task;
self.Bbuffers;
self.maxNumPoints = 0;
self.prevBuffer = new Uint8Array(0);
self.numBytesRead = 0;
self.totalBytesRead = 0;
self.streamReader;
self.lidarTime;

var LoaderStates = Object.freeze({UNINITIALIZED: 0, PAUSED: 1, LOADING: 2, STOPPED: 3});
self.LoaderState = LoaderStates.STOPPED;
// runState();  // TODO is this needed

var pumpCount = 0; // TODO REMOVE
var maxPumpCount = 400; // TODO REMOVE

console.log("Data Loader Created!");

function runState() {  // Run State
  if (self.LoaderState == LoaderStates.LOADING) { // must have a streamReader
    pump();
  } else if (self.LoaderState == LoaderStates.UNINITIALIZED) {
    console.log("data loader uninitialized");
    // continue;
  } else if (self.LoaderState == LoaderStates.PAUSED){
    console.log("data loader paused");
    closeStream(); // See note for resume state in handleInputMessage function

    // continue;
  } else if (self.LoaderState == LoaderStates.STOPPED) {
    console.log("data loader is stopped");
    closeStream();
    resetBuffers();
  }
}


self.onmessage = handleInputMessage;
function handleInputMessage(e) {

  if (e.data.msg == "pause") {
    pause();

  } else if (e.data.msg == "resume") {
    resume();


  } else if (e.data.msg == "stop") { // TODO initialize
    stop();

  } else if (e.data.msg == "restart") { // TODO initialize
    restart(e.data.task);

  } else if (e.data.msg == "slice") {

    // Slice Bbuffers:
    var tmin = e.data.tmin;
    var tmax = e.data.tmax;
    slice(tmin, tmax);

  } else if (e.data.msg == "heartbeat") {

    // Send Heartbeat update:
    sendHeartbeat();

  } else if (e.data.msg == "lidarTime") {

    // Save lidarTime:
    updateLidarTime(e.data.time);
    console.log("lidarTime heartbeat: ", self.lidarTime);

  } else if (e.data.msg == "runState") {
    runState();
  }
}

function sendFetchRequest(task, shouldResetBuffers=true) {

  // Parse task:
  self.task = task;
  var url = task.serverUrl + ":" + task.port + "/args/data/" + task.filename; // TODO fix this
  var seekPosBytes = task.seekPosBytes;
  if (seekPosBytes < 0 || seekPosBytes > task.filesize) {
    console.error("Failed invalid seekPositionBytes value: ", seekPosBytes);
  }

  // Create fetch headers:
  var fetchHeaders = new Headers();
  fetchHeaders.append("X-Seek-Position", seekPosBytes);
  var myInit = {headers: fetchHeaders};
  console.log("worker received: ", myInit.headers.get("x-seek-position"));

  // Compute max number of points:
  self.maxNumPoints = task.maxMemMB/task.bytesPerPoint*1e6; // TODO move to initialize function and initialize Bbuffers there (see resetBuffers())

  if (shouldResetBuffers) {
    resetBuffers(); // reset buffers with new maxNumPoints
  }

  // Send fetch request:
  fetch(url, myInit)
  .then((res) => handleFetchResponse(res))
  .catch((err) => console.log("Worker Fetch Error: ", err));
}

function handleFetchResponse(response, readUntil=-1) {

    var stream = response.body;
    var reader = stream.getReader();
    if ( typeof(reader) != "undefined") {
      self.tReadStart = performance.now();
      self.streamReader = reader;
      self.LoaderState = LoaderStates.LOADING;
      runState();
    }
}

function pump() { // TODO add streamReader function parameter, remove pump at end
  self.streamReader.read().then((e) => {

    // pumpCount++; // TODO REMOVE
    // if (pumpCount > maxPumpCount) {
    //   console.log("Terminated with pump count: ", pumpCount, "(greater than max pump count)");
    //   return;
    // }

    // Check if reached end of file:
    if (e.done) {
      // terminate();
      console.log("Reached end of file");
      self.LoaderState = LoaderStates.PAUSED;
      runState();
    } else {

      // Append stream data into Bbuffers:
      // var buffer = e.value;
      var buffer = concatTypedArrays(self.prevBuffer, e.value); // TODO assumption is that e.value is Uint8Array
      var view = new DataView(buffer.buffer);
      self.numBytesRead = 0;

      for (let ii=0, len = (buffer.length-task.bytesPerPoint); ii < len; ii+=task.bytesPerPoint) {

        // TODO Optimize this use of the cbuffers:
        self.Bbuffers.pos.push(view.getFloat64(ii+task.offsets.x, true) + task.header.x0);
        self.Bbuffers.pos.push(view.getFloat64(ii+task.offsets.y, true) + task.header.y0);
        self.Bbuffers.pos.push(view.getFloat64(ii+task.offsets.z, true) + task.header.z0);

        self.Bbuffers.i.push(view.getFloat64(ii+task.offsets.i, true));

        self.Bbuffers.t.push(view.getFloat64(ii+task.offsets.t, true));

        self.numBytesRead += task.bytesPerPoint; // we just read 1 point into our buffers TODO make var variable

        self.task.seekPosBytes += task.bytesPerPoint; // track current seek position in file -- NOTE this forces restart command to start from this point...is this ok?
        if (self.task.seekPosBytes > self.task.filesize) { // NOTE We should never hit this (i.e. assertion)
          debugger;
        }

        if (self.Bbuffers.t.length == self.Bbuffers.t.size) { // TODO check if we are going to overwrite data we want still
                                                              // NOTE can do this check before the loop even starts like so:
                                                              // t0 = self.lidarTime;
                                                              // TB0 = self.Bbuffers.t.data[0];
                                                              // if (t0 - TB0 >= 0) { // execute for loop } else { // save read buffer and pause DataLoader }
                                                              // NOTE in order for this to work, need pause/resume functionality to be working

        }

        // NOTE because Javascript is only single threaded, we should never hit the code below:
        // Check if should stop loading:
        if (self.LoaderState != LoaderStates.LOADING) {
          debugger;
          if (self.LoaderState == LoaderStates.STOPPED) {
            // Do not save remaining buffer and run next state:
            self.totalBytesRead += self.numBytesRead;
            self.prevBuffer = new Uint8Array(0);
            runState();
          } else if (self.LoaderState == LoaderStates.PAUSED) {
            // Break out of loop, store remaining buffer and run next state
            // TODO RACE CONDITIONS POSSIBLE!! NEED runState(PAUSED) explicitly
            debugger;
            break;
          }
        }
      }

      // Record remaining buffer and run next state:
      self.totalBytesRead += self.numBytesRead;
      self.prevBuffer = buffer.slice(self.numBytesRead, buffer.length);  // TODO revert this

      // Run again:
      // setTimeout(runState,0); // TODO USE SETTIMEOUT(0) -- check how much of a hit to run speed there is (pretty big -- need to speed this up)

      // post a message to main thread who will send it back where we run next state (intent is that this is faster than setTimeout(0))
      self.postMessage({msg:"runState"});

    }
  });
}

function resetBuffers() {

  // Create SecondaryBuffers:
  self.Bbuffers = {
    pos: new CBuffer(3*self.maxNumPoints),
    i: new CBuffer(1*self.maxNumPoints),
    t: new CBuffer(1*self.maxNumPoints)
  }

  self.prevBuffer = new Uint8Array(0);
}

function closeStream() {

  // Close Stream Reader if exists:
  try {
    self.streamReader.cancel().catch((e) => console.log("warning -- ", e));
    self.streamReader.releaseLock();
  } catch (e) {
    console.log("warning: ", e);
  }

  // Compute Performance Statistics:
  var tfinal = performance.now()
  var dtLifetimeMillis = tfinal - self.tLifeStart;
  var dtReadtimeMillis = tfinal - self.tReadStart;
  console.log("closing current stream -- readtime: ", (dtReadtimeMillis/1000), "seconds");

  // TODO Transfer ownership of Bbuffers??
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

  // Transfer Slices to runState:
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
  // console.log("sending heartbeat from dataloader");
  // debugger;
  try {
    // Send status update:
    self.postMessage({
      msg: "heartbeat",
      tmin: self.Bbuffers.t.data[self.Bbuffers.t.start],
      tmax: self.Bbuffers.t.data[self.Bbuffers.t.end],
      numPoints: self.Bbuffers.t.length,
      numBytesRead: self.numBytesRead,
      totalBytesRead: self.totalBytesRead,
      state: self.LoaderState
    });
  } catch (e) {
    // debugger;
    console.log("Failed to send heartbeat: ", e);
  }
}

function pause() {
  // Pause DataLoader if loading:
  if (self.LoaderState == LoaderStates.LOADING) {
    self.LoaderState = LoaderStates.PAUSED; // Set state to paused
    // TODO experimental
    self.postMessage({msg: "request-slice"}); // Going to be paused so ask for slice request
    runState();
  }
}

function resume() {
  // Resume DataLoader if paused:
  if (self.LoaderState == LoaderStates.PAUSED) {
    // NOTE: Since we cannot pause the readable stream while piped into it,
    // we need to cancel the old stream and create a new stream at the previous location
    closeStream(); // Maybe move this into runState(PAUSED) to stop streaming at point of pausing?

    // Modify loader task with current seekPosBytes:
    var resumeTask = self.task;
    // resumeTask.seekPosBytes += self.numBytesRead; // NOTE removed, seekPosBytes now tracked in main for loop b/c numBytesRead was limited to max size of single buffer
    var shouldResetBuffers = false; // Don't reset buffers
    self.prevBuffer = new Uint8Array(0); // NOTE resetting prevBuffer however -- because we start a new stream at the last point read, we don't need the previous buffer
                                         // TODO remove resetting of previous buffer from resetBuffers() function?
    sendFetchRequest(resumeTask, shouldResetBuffers);
  }
}

function stop() {
  // Stop DataLoader:
  self.LoaderState = LoaderStates.STOPPED;
  runState();
}

function restart(task=null) {
  // Start/Restart DataLoader:
  // Close Stream and Reset Buffers:
  self.LoaderState = LoaderStates.STOPPED; // Set state to STOPPED until data fetch response is received
  runState();

  // Try to restart the previous task if exists:
  try {
    if (task) {
      sendFetchRequest(task);
    } else if (self.task) {
      sendFetchRequest(self.task);
    }
  } catch (e) {
    console.log("Could not restart stream -- ", e);
  }
}

function updateLidarTime(newLidarTime) {

  // Store new lidarTime:
  self.lidarTime = newLidarTime;
  var epsilonNumPoints = 500000;

  // TODO: assert that lidarTime, self.Bbuffers.t.data[0], task all exist and are valid
  if ((self.lidarTime != null) && (self.Bbuffers.t.data[0] != null) && (task != null)) {

    if (self.Bbuffers.t.length == self.Bbuffers.t.size) { // Buffer must be full
      var loadableSecs = self.lidarTime - self.Bbuffers.t.data[self.Bbuffers.t.start];
      var loadableBytes = Math.floor(loadableSecs / (task.header.tmax - task.header.tmin) * task.header.numpoints) * task.bytesPerPoint;

      if (loadableBytes > 0) {
        if (loadableBytes/task.bytesPerPoint > (task.maxNumPoints-epsilonNumPoints)) {
          // handle the case where lidarTime is approaching end of buffer
          console.log("DataLoader is falling behind");
          // TODO

        } else {
          // continue normal loading (resume if paused)
          console.log("DataLoader is loading as normal");
          resume();
        }
      } else if (loadableBytes <= 0) {
        if (Math.abs(loadableSecs) < self.task.bufferEpsilonSec) {
          // pause loader until lidarTime catches up to buffer
          console.log("DataLoader is pausing");
          pause();
        } else {
          // compute new seekPosBytes at current lidarTime and restart()
          // TODO handle caching of buffer eventually -- for now throw it all away
          console.log("DataLoader should restart from new seek point");


        }
      }
    }

  } else {
    console.log("DataLoader does not have enough information to update state");
    // debugger;
  }
}
