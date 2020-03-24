import { getLoadingBar, getLoadingBarTotal, numberDownloads } from "../common/overlay.js";

export async function loadRem(s3, bucket, name, remShaderMaterial, animationEngine, callback) {
  const tstart = performance.now();
  let loadingBar = getLoadingBar();
  let loadingBarTotal = getLoadingBarTotal(); 
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

      const request = s3.getObject({Bucket: bucket,
                    Key: objectName},
                   async (err, data) => {
                     if (err) {
                       console.log(err, err.stack);
                     } else {
                       const FlatbufferModule = await import(schemaUrl);
                       const remSphereMeshes = parseControlPoints(data.Body, remShaderMaterial, FlatbufferModule, animationEngine);
                       callback( remSphereMeshes );
                     }});
      request.on("httpDownloadProgress", (e) => {
        let val = e.loaded/e.total * 100;  
        val = Math.max(lastLoaded, val);
        loadingBar.set(val);
        lastLoaded = val;
      });
      
      request.on("complete", () => {
        loadingBarTotal.set(loadingBarTotal.value + (100/numberDownloads));
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

      let bytesArray = new Uint8Array(response);
      const remSphereMeshes = parseControlPoints(bytesArray, remShaderMaterial, FlatbufferModule, animationEngine);
      callback( remSphereMeshes );
    };

    t0 = performance.now();
    xhr.send();
  }
}

// parse control points from flatbuffers
function parseControlPoints(bytesArray, remShaderMaterial, FlatbufferModule, animationEngine) {

  let numBytes = bytesArray.length;
  let controlPoints = [];

  let segOffset = 0;
  let segSize, viewSize, viewData;
  while (segOffset < numBytes) {

    // Read SegmentSize:
    viewSize = new DataView(bytesArray.buffer, segOffset, 4);
    segSize = viewSize.getUint32(0, true); // True: little-endian | False: big-endian

    // Get Flatbuffer Gap Object:
    segOffset += 4;
    let buf = new Uint8Array(bytesArray.buffer.slice(segOffset, segOffset+segSize));
    let fbuffer = new flatbuffers.ByteBuffer(buf);
    let point = FlatbufferModule.Flatbuffer.Primitives.Sphere3D.getRootAsSphere3D(fbuffer);

    controlPoints.push(point);
    segOffset += segSize;
  }
  return createControlMeshes(controlPoints, remShaderMaterial, FlatbufferModule, animationEngine);
}


function createControlMeshes(controlPoints, remShaderMaterial, FlatbufferModule, animationEngine) {

  let point;

  let allSpheres = [];
  let controlTimes = [];
  for(let ii=0, len=controlPoints.length; ii<len; ii++) {

    point = controlPoints[ii];

    var vertex = {x: point.pos().x(), y: point.pos().y(), z: point.pos().z()};
    var radius = 0.25;//point.radius();
    var timestamp = point.viz(new FlatbufferModule.Flatbuffer.Primitives.HideAndShowAnimation())
       .timestamp(new FlatbufferModule.Flatbuffer.Primitives.ObjectTimestamp())
       .value() - animationEngine.tstart;


    var timestampArray = [];
    for (let ii = 0; ii < 63; ii++) {
      timestampArray.push(timestamp)
    }

    var sphereGeo = new THREE.SphereBufferGeometry(radius);
    remShaderMaterial.uniforms.color.value = new THREE.Color(0x00ffff);
    var sphereMesh = new THREE.Mesh(sphereGeo, remShaderMaterial);
    sphereMesh.position.set(vertex.x, vertex.y, vertex.z);
    sphereMesh.geometry.addAttribute('gpsTime', new THREE.Float32BufferAttribute(timestampArray, 1));
    allSpheres.push(sphereMesh);
  }

  return allSpheres;
}
