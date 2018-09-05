// Import Scripts:
self.importScripts("../libs/three.js/build/three.js");

// Get Current Point Cloud:

console.log("started worker!");


self.onmessage = function(message) {

  console.log("received message");
  console.log(message);

  var attributes = message.data["point-attributes"];
  console.log(attributes);
  // debugger; //attributes.position
  allPoints = attributes.position;

  // Create Circular buffer of points:
  numPoints = 3000000;
  updateBatchSize = 1000000;
  updatePeriodMillis = 1000; // ms
  attrDim = 3;

  var startIdx=0, endIdx=0;
  var ii = 0;

  // Loop over all batches once:
  function loop() {
    if (ii*updateBatchSize < allPoints.count) {
      startIdx = ii*updateBatchSize*attrDim;
      endIdx = Math.min((startIdx+attrDim*numPoints), allPoints.array.length);
      var message = {
        'terminate': false,
        // 'points': allPoints.array.slice(startIdx, endIdx)
        'slice': allPoints.array.slice(startIdx, endIdx)
        // 'points': new THREE.BufferAttribute(allPoints.array.slice(startIdx, endIdx), 3)
      }
      // debugger; //slice
      postMessage(message); // Post back to main thread
      ii++;
      setTimeout(loop, updatePeriodMillis);
    } else {
      var message = {
        "terminate": true,
        "points": null
      }
      postMessage(message);
      // restart loop
      // ii = 0;
      // loop();
    }
  }

  loop();
}
