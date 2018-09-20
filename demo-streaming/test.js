self.importScripts("bower_components/cbuffer/cbuffer.js", "bufferFunctions.js");


self.onmessage = function(e) {

  runPumpTest();
}


function runPumpTest() {

  var bytesPerPoint = 20;
  bufferLen = 65520;
  var prevBuffer = new Uint8Array(20);
  var databuffer = new Uint8Array(bufferLen);
  var pos = new CBuffer(3*bufferLen);
  var intensity = new CBuffer(bufferLen);
  var time = new CBuffer(bufferLen);


  var numBytesRead = 0;
  var seekPosBytes = 0;
  var filesize = 100000;

  console.time("pump test");


  var buffer = concatTypedArrays(prevBuffer, databuffer); // TODO assumption is that e.value is Uint8Array
  var view = new DataView(buffer.buffer);
  var numBytesRead = 0;


  for (let ii=0, len = (buffer.length-bytesPerPoint); ii < len; ii+=bytesPerPoint) {

    // TODO Optimize this use of the cbuffers:
    pos.push(view.getFloat32(ii+0, true));
    pos.push(view.getFloat32(ii+4, true));
    pos.push(view.getFloat32(ii+8, true));

    intensity.push(view.getFloat32(ii+12, true));

    time.push(view.getFloat32(ii+16, true));

    numBytesRead += bytesPerPoint; // we just read 1 point into our buffers TODO make var variable

    seekPosBytes += bytesPerPoint; // track current seek position in file -- NOTE this forces restart command to start from this point...is this ok?
    if (seekPosBytes > filesize) { // NOTE We should never hit this (i.e. assertion)
      // debugger;
    }

    if (time.length == time.size) { // TODO check if we are going to overwrite data we want still
                                                          // NOTE can do this check before the loop even starts like so:
                                                          // t0 = self.lidarTime;
                                                          // TB0 = self.Bbuffers.t.data[0];
                                                          // if (t0 - TB0 >= 0) { // execute for loop } else { // save read buffer and pause DataLoader }
                                                          // NOTE in order for this to work, need pause/resume functionality to be working

    }
  }
  console.timeEnd("pump test");
}
