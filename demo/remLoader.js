'use strict';
import { getShaderMaterial } from "../demo/paramLoader.js"
import { getLoadingBar, getLoadingBarTotal, numberTasks, removeLoadingScreen, pause } from "../common/overlay.js";

export async function loadRem(s3, bucket, name, remShaderMaterial, animationEngine, callback) {
  const tstart = performance.now();
  const loadingBar = getLoadingBar();
  const loadingBarTotal = getLoadingBarTotal(); 
  let lastLoaded = 0;
  //is name here the dataset name? We should be more careful about that....
  if (s3 && bucket && name) {
    (async () => {
      const objectName = `${name}/3_Assessments/control_point_3_rtk_relative.fb`//`${name}/3_Assessments/gaps.fb`;//fb schema from s3
      //s3://veritas-aptiv-2019-02-11/Data/REM-Lane1-Run1_2019-08-01¶002/3_Assessments/control_point_3_rem_relative.fb
      const schemaFile = `${name}/5_Schemas/VisualizationPrimitives_generated.js`;//remschemafile from s3

      const schemaUrl = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: schemaFile
      });
      const request = await s3.getObject({Bucket: bucket,
                    Key: objectName},
                   async (err, data) => {
                     if (err) {
                       console.log(err, err.stack);
                       // have to increment progress bar since "parseControlPoints" will not be called
                       loadingBarTotal.set(Math.min(Math.ceil(loadingBarTotal.value + (100/numberTasks))), 100);
                     } else {
                       const FlatbufferModule = await import(schemaUrl);
                       const remSphereMeshes = await parseControlPoints(data.Body, remShaderMaterial, FlatbufferModule, animationEngine);
                       await callback( remSphereMeshes );
                     }
                     if (loadingBarTotal.value  == 100) {
                      removeLoadingScreen();
                     }});
      request.on("httpDownloadProgress", async (e) => {
        let val = e.loaded/e.total * 100;  
        val = Math.max(lastLoaded, val);
        loadingBar.set(Math.max(val, loadingBar.value));
        lastLoaded = val;
        await pause();
      });
      
      request.on("complete", async () => {
        loadingBarTotal.set(Math.min(Math.ceil(loadingBarTotal.value + (100/numberTasks))), 100);
        loadingBar.set(0);
        if (loadingBarTotal.value >= 100) {
          removeLoadingScreen();
        }
        await pause();
      });
    })();

  } else {
    const filename = `../data/control_point_3_rtk_relative.fb`;
    const schemaFile = "../schemas/VisualizationPrimitives_generated.js";
    let t0, t1;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", filename);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = function(event) {
      t1 = performance.now();
      t0 = t1;
    }

    xhr.onload = async function(data) {

      const FlatbufferModule = await import(schemaFile);

      const response = data.target.response;
      if (!response) {
        console.error("Could not create buffer from lane data");
        return;
      }

      const bytesArray = new Uint8Array(response);
      const remSphereMeshes = await parseControlPoints(bytesArray, remShaderMaterial, FlatbufferModule, animationEngine);
      await callback( remSphereMeshes );
    };

    t0 = performance.now();
    xhr.send();
  }
}

// parse control points from flatbuffers
async function parseControlPoints(bytesArray, remShaderMaterial, FlatbufferModule, animationEngine) {

  const numBytes = bytesArray.length;
  const controlPoints = [];

  let segOffset = 0;
  let segSize, viewSize, viewData;
  while (segOffset < numBytes) {

    // Read SegmentSize:
    viewSize = new DataView(bytesArray.buffer, segOffset, 4);
    segSize = viewSize.getUint32(0, true); // True: little-endian | False: big-endian

    // Get Flatbuffer Gap Object:
    segOffset += 4;
    const buf = new Uint8Array(bytesArray.buffer.slice(segOffset, segOffset+segSize));
    const fbuffer = new flatbuffers.ByteBuffer(buf);
    const point = FlatbufferModule.Flatbuffer.Primitives.Sphere3D.getRootAsSphere3D(fbuffer);

    controlPoints.push(point);
    segOffset += segSize;
  }
  return await createControlMeshes(controlPoints, remShaderMaterial, FlatbufferModule, animationEngine);
}


async function createControlMeshes(controlPoints, remShaderMaterial, FlatbufferModule, animationEngine) {
  const loadingBar = getLoadingBar();
  const loadingBarTotal = getLoadingBarTotal(); 

  const allSpheres = [];
  const controlTimes = [];
  for(let ii=0, len=controlPoints.length; ii<len; ii++) {
    if (ii % 1000 == 0) {
      loadingBar.set(Math.max(ii/len * 100, loadingBar.value)); // update individual task progress
      await pause()
    }
    const point = controlPoints[ii];

    const vertex = {x: point.pos().x(), y: point.pos().y(), z: point.pos().z()};
    const radius = 0.25;//point.radius();
    const timestamp = point.viz(new FlatbufferModule.Flatbuffer.Primitives.HideAndShowAnimation())
    .timestamp(new FlatbufferModule.Flatbuffer.Primitives.ObjectTimestamp())
    .value() - animationEngine.tstart;
    
    
    const timestampArray = Array(64).fill(timestamp)

    const sphereGeo = new THREE.SphereBufferGeometry(radius);
    remShaderMaterial.uniforms.color.value = new THREE.Color(0x00ffff);
    const sphereMesh = new THREE.Mesh(sphereGeo, remShaderMaterial);
    sphereMesh.position.set(vertex.x, vertex.y, vertex.z);
    sphereMesh.geometry.addAttribute('gpsTime', new THREE.Float32BufferAttribute(timestampArray, 1));
    allSpheres.push(sphereMesh);
  }

  // update total progress
  loadingBarTotal.set(Math.min(Math.ceil(loadingBarTotal.value + (100/numberTasks))), 100);
  loadingBar.set(0);
  if (loadingBarTotal.value >= 100) {
    removeLoadingScreen();
  }
  await pause()
  return allSpheres;
}



//load REM control points
export async function loadRemCallback(s3, bucket, name, animationEngine) {
	const shaderMaterial = getShaderMaterial();
	const remShaderMaterial = shaderMaterial.clone();
	await loadRem(s3, bucket, name, remShaderMaterial, animationEngine, (sphereMeshes) => {
		const remLayer = new THREE.Group();
    remLayer.name = "REM Control Points";
    sphereMeshes.map(mesh => remLayer.add(mesh))

		viewer.scene.scene.add(remLayer);
		const e = new CustomEvent("truth_layer_added", {detail: remLayer, writable: true});
		viewer.scene.dispatchEvent({
			"type": "sensor_layer_added",
			"sensorLayer": remLayer
		});

		// TODO check if group works as expected, then trigger "truth_layer_added" event
		animationEngine.tweenTargets.push((gpsTime) => {
			const currentTime = gpsTime - animationEngine.tstart;
			remShaderMaterial.uniforms.minGpsTime.value = currentTime + animationEngine.activeWindow.backward;
			remShaderMaterial.uniforms.maxGpsTime.value = currentTime + animationEngine.activeWindow.forward;
		});
	});
}
