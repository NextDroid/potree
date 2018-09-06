function mainLoopSwap() {
  console.log("mainloop - simple");
  var cloud = viewer.scene.scene.getObjectByName('cloud');
  cloud.geometry.addAttribute('position', geoms[1].attributes.position.clone());
}



function mainLoopCircular(mesh) {
  console.log('mainloop - circular');
  addPointMesh(mesh);

  var w;
  var positionAttribute;
  // Get Current Point Cloud:
  var cloud = viewer.scene.scene.getObjectByName("cloud");

  function startWorker() {

    if (typeof(w) == "undefined") {

      w = new Worker("worker-circular.js");
      w.postMessage({"point-attributes": geoms[0].attributes}); // send cloud to worker and trigger execution
      console.log(geoms[0].attributes);

      w.onmessage = function(e) {
        console.log('worker posted data');
        console.log(e.data);

        if (e.data.terminate) {
          console.log("TERMINATE");
          stopWorker();
        } else {
          // Update cloud position attribute
          // console.log(cloud);
          // debugger; // cloud
          console.log('update cloud position attribute');
          positionAttribute = new THREE.Float32BufferAttribute(e.data.slice, 3);
          // cloud.geometry.attributes.position.array = e.data.points;
          cloud.geometry.addAttribute('position', positionAttribute);
          console.log(cloud.geometry.attributes.position);
        }

      }

    }
  }

  function stopWorker() {
    if (typeof(w) != "undefined") {
      w.terminate();
      w = undefined;
      console.log("terminated worker");
      var dt = performance.now() - t0;
      console.log("Total Runtime: " + (dt/1000) + " seconds");
    }
  }

  startWorker();

}
