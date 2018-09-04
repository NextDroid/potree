function mainLoopSwap() {
  console.log("mainloop - simple");
  var cloud = viewer.scene.scene.getObjectByName('cloud');
  cloud.geometry.addAttribute('position', geoms[1].attributes.position.clone());
}



function mainLoopCircular(mesh) {
  console.log('mainloop - circular');
  addPointMesh(mesh);

  var w;

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
          stopWorker();
        } else {
          // Update cloud position attribute
          // debugger;
          console.log('update cloud position attribute');
          cloud.geometry.addAttribute('position', e.data.points);
          console.log(cloud.geometry.position.count);
        }

      }

    }
  }

  function stopWorker() {
    if (typeof(w) != "undefined") {
      w.terminate();
      w = undefined;
      console.log("terminated worker");
    }
  }

  startWorker();

}
