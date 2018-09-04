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
  numPoints = 6000000;
  updateBatchSize = 1000000;
  updatePeriodMillis = 1000; // ms

  var startIdx, endIdx;
  var ii = 0;

  // Loop over all batches once:
  function loop() {
    if (ii < allPoints.count) {
      startIdx = ii;
      endIdx = Math.min((startIdx+3*numPoints), allPoints.count+1);
      var message = {
        'terminate': false,
        // 'points': allPoints.array.slice(startIdx, endIdx)
        'points': new THREE.Float32BufferAttribute(allPoints.array.slice(startIdx, endIdx), 3)
      }
      postMessage(message); // Post back to main thread
      ii += updateBatchSize*3;
      setTimeout(loop, updatePeriodMillis);
    } else {
      var message = {
        "terminate": true,
        "points": null
      }
      // restart loop
      // ii = 0;
      // loop();
    }
  }

  loop();
}
