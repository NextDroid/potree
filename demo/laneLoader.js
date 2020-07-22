'use strict';
import { Measure } from "../src/utils/Measure.js";
import { LaneSegments } from "./LaneSegments.js"
import { visualizationMode, comparisonDatasets, s3, bucket, name } from "../demo/paramLoader.js"
import { updateLoadingBar, incrementLoadingBarTotal, resetProgressBars } from "../common/overlay.js";
import { getFbFileInfo, getFilesFromS3 } from "./loaderUtilities.js";


let laneFiles = null;
export const laneDownloads = async (datasetFiles) => {
  laneFiles = await getFbFileInfo(datasetFiles,
                                  "lanes.fb", // 2_Truth
                                  "GroundTruth_generated.js", // 5_Schemas
                                  "../data/lanes.fb",
                                  "../schemas/GroundTruth_generated.js");
  return laneFiles
}

export async function loadLanes(s3, bucket, name, fname, supplierNum, annotationMode, volumes, callback) {
  const tstart = performance.now();

  if (!laneFiles) {
    console.log("No lane files present")
    return
  }

  if (s3 && bucket && name && fname) {
    (async () => {
      const schemaUrl = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: laneFiles.schemaFile
      });

      const request = await s3.getObject({
        Bucket: bucket,
        Key: `${name}/2_Truth/${fname}`
      },
      async (err, data) => {
        if (err) {
          console.error(err, err.stack);
        } else {
          const FlatbufferModule = await import(schemaUrl);
          const laneGeometries = await parseLanes(data.Body, FlatbufferModule, supplierNum, annotationMode, volumes);
          await callback( laneGeometries );
        }
        incrementLoadingBarTotal("loaded lanes")
      });
      request.on("httpDownloadProgress", async (e) => {
        await updateLoadingBar(e.loaded/e.total * 100)
      });

      request.on("complete", () => {
        incrementLoadingBarTotal("downloaded lanes")
      });
    })();
  } else {
    let t0, t1;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", laneFiles.objectName);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = async (e) => {
      await updateLoadingBar(e.loaded/e.total*100)
      t1 = performance.now();
      t0 = t1;
    }

    xhr.onload = async (data) => {
      incrementLoadingBarTotal("downloaded lanes")
      const FlatbufferModule = await import(laneFiles.schemaFile);

      const response = data.target.response;
      if (!response) {
        console.error("Could not create buffer from lane data");
        return;
      }

      let bytesArray = new Uint8Array(response);
      const laneGeometries = await parseLanes(bytesArray, FlatbufferModule, supplierNum, annotationMode, volumes);
      await callback( laneGeometries );
      incrementLoadingBarTotal("loaded lanes")
    };

    t0 = performance.now();
    xhr.send();
  }
}


async function parseLanes(bytesArray, FlatbufferModule, supplierNum, annotationMode, volumes) {

  const numBytes = bytesArray.length;
  const lanes = [];

  let segOffset = 0;
  let segSize, viewSize;
  while (segOffset < numBytes) {

    // Read SegmentSize:
    viewSize = new DataView(bytesArray.buffer, segOffset, 4);
    segSize = viewSize.getUint32(0, true); // True: little-endian | False: big-endian

    // Get Flatbuffer Lane Object:
    segOffset += 4;
    const buf = new Uint8Array(bytesArray.buffer.slice(segOffset, segOffset + segSize));
    const fbuffer = new flatbuffers.ByteBuffer(buf);
    const lane = FlatbufferModule.Flatbuffer.GroundTruth.Lane.getRootAsLane(fbuffer);

    lanes.push(lane);
    segOffset += segSize;
  }
  return await createLaneGeometriesOld(lanes, supplierNum, annotationMode, volumes);
}


// TODO we are not using this function and will need to rewrite is to accomodate annotations and amomalies. Recmommend removing
// function splitLaneVertices(lanes) {
//
//   let leftVertices = [];
//   let rightVertices = [];
//   let spineVertices = [];
//
//   let lane, vtx, laneVertices;
//   for (let ii=0, numLanes=lanes.length; ii<numLanes; ii++) {
//
//     lane = lanes[ii];
//
//     laneVertices = [];
//     for (let jj=0, numLeftVtx=lane.leftLength(); jj<numLeftVtx; jj++) {
//       vtx = lane.left(jj);
//       laneVertices.push( new THREE.Vector3(vtx.x(), vtx.y(), vtx.z()) );
//     }
//     leftVertices.push(laneVertices);
//
//     laneVertices = [];
//     for (let jj=0, numRightVtx=lane.rightLength(); jj<numRightVtx; jj++) {
//       vtx = lane.right(jj);
//       laneVertices.push( new THREE.Vector3(vtx.x(), vtx.y(), vtx.z()) );
//     }
//     rightVertices.push(laneVertices);
//
//     laneVertices = [];
//     for (let jj=0, numSpineVtx=lane.spineLength(); jj<numSpineVtx; jj++) {
//       vtx = lane.spine(jj);
//       spineVertices.push( new THREE.Vector3(vtx.x(), vtx.y(), vtx.z()) );
//     }
//     spineVertices.push(laneVertices);
//   }
//
//   let output = {
//     leftGroups: leftVertices,
//     rightGroups: rightVertices,
//     spineGroups: spineVertices
//   }
//
//   return output;
// }


// TODO we are not using this function and will need to rewrite is to accomodate annotations and amomalies. Recmommend removing
// function createLaneGeometries(vertexGroups, material) {
//
//   let laneGeometries = [];
//   let allBoxes = new THREE.Geometry();
//
//   let allLanes = [];
//   let vertexGroup;
//   let v1, v2;
//   let length, width, height;
//   let vector, axis;
//   let center, firstCenter, delta;
//   let boxGeometry, se3, quaternion;
//   debugger; // vertexGroups.length
//   for (let ii=0, len=vertexGroups.length; ii<len; ii++) {
//
//     vertexGroup = vertexGroups[ii];
//
//     for (let jj=1, numVertices=vertexGroup.length; jj<numVertices; jj++) {
//
//       v1 = vertexGroup[jj-1];
//       v2 = vertexGroup[jj];
//
//       length = v1.distanceTo(v2);
//       height = 0.01;
//       width = 0.1;
//
//       vector = v2.sub(v1);
//       axis = new THREE.Vector3(1, 0, 0);
//       center = v1.addScaledVector(vector, 0.5);
//
//       if (firstCenter == undefined) {
//         firstCenter = center.clone();
//       }
//
//       delta = center.clone().sub(firstCenter);
//       lastCenter = center.clone();
//       // debugger; // delta
//
//       // Transform Box:
//       boxGeometry = new THREE.BoxGeometry(length, width, height);
//       se3 = new THREE.Matrix4();
//       quaternion = new THREE.Quaternion().setFromUnitVectors(axis, vector.clone().normalize());
//       // debugger; // se3;
//       se3.makeRotationFromQuaternion(quaternion); // Rotation
//       se3.setPosition(delta); // Translation
//
//       boxGeometry.applyMatrix( se3 );
//       allBoxes.merge(boxGeometry);
//
//       if ((ii%10000)==0 || ii==(len-1)) {
//         // let mesh = new THREE.Mesh(allBoxes, new THREE.MeshBasicMaterial({color:0x00ff00}));
//         let mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(allBoxes), material); // Buffergeometry
//         mesh.position.copy(firstCenter);
//         laneGeometries.push(mesh);
//         allBoxes = new THREE.Geometry();
//         firstCenter = center.clone();
//       }
//
//
//     }
//   }
//
//   return laneGeometries;
// }


// async function in order to enable a real time loading bar (caller functions must also use async/await)
// without it the javascript code will run and block the UI that needs to update the loading bar (remove at your own risk)
async function createLaneGeometriesOld (lanes, supplierNum, annotationMode, volumes) {

  const laneColors = getLaneColorScheme(supplierNum);
  const materialLeft = laneColors[0];
  const materialRight = laneColors[1];
  const materialSpine = laneColors[2];

  const laneLeft = new Measure(); laneLeft.name = "Lane Left"; laneLeft.closed = false; laneLeft.showCoordinates = true; laneLeft.showAngles = true;
  // const laneSpine = new Measure(); laneSpine.name = "Lane Spine"; //laneRight.closed = false;
  const laneRight = new Measure(); laneRight.name = "Lane Right"; laneRight.closed = false; laneRight.showCoordinates = true; laneRight.showAngles = true;

  const leftLaneSegments = new LaneSegments(); leftLaneSegments.name = "Left Lane Segments";
  const rightLaneSegments = new LaneSegments(); rightLaneSegments.name = "Right Lane Segments";

  const clonedBoxes = [];
  for (let vi=0, vlen=volumes.length; vi<vlen; vi++) {
    if (volumes[vi].clip) {
      const clonedBbox = volumes[vi].boundingBox.clone();
      clonedBbox.applyMatrix4(volumes[vi].matrixWorld);
      clonedBoxes.push(clonedBbox);
    }
  }

  // let lefts = [];
  // let rights = [];
  // let spines = [];
  const all = [];
  const leftAnomalies = [];
  const rightAnomalies = [];
  let allBoxes = new THREE.Geometry();

  // have to load left, right, spine and creatingBoxes for each (split 100% evenly)
  const numLaneTasks = 6*lanes.length // 6 for each iteration
  const toLoad = 100/numLaneTasks
  let stagesComplete = 0

  for (let ii = 0, len = lanes.length; ii < len; ii++) {

    const lane = lanes[ii];

    var geometryLeft = new THREE.Geometry();
    var geometrySpine = new THREE.Geometry();
    var geometryRight = new THREE.Geometry();
    let isContains = false;

    const calcLoaded = async (prog, total) => {
      // always update # stages compelete
      if (prog == total-1) {
        stagesComplete++
      }
    }

    const anomalyMode = !!lane.leftPointValidity;

    for (let jj = 0, numVertices = lane.leftLength(); jj < numVertices; jj++) {
      const left = lane.left(jj);
      if (annotationMode) {
        if (volumes.length === 0) {
          laneLeft.addMarker(new THREE.Vector3(left.x(), left.y(), left.z()));
        } else {
          isContains = updateSegments(leftLaneSegments, clonedBoxes, isContains, left, jj, numVertices);
        }
      } else {
        geometryLeft.vertices.push(new THREE.Vector3(left.x(), left.y(), left.z()));
        if (anomalyMode && lane.leftPointValidity(jj) === 1) {
          leftAnomalies.push(new THREE.Vector3(left.x(), left.y(), left.z()));
        }
      }
    }

    isContains = false;
    for (let jj = 0, numVertices = lane.rightLength(); jj < numVertices; jj++) {
      await calcLoaded(jj, numVertices)
      const right = lane.right(jj);

      if (annotationMode) {
        if (volumes.length === 0) {
          laneRight.addMarker(new THREE.Vector3(right.x(), right.y(), right.z()));
        } else {
          isContains = updateSegments(rightLaneSegments, clonedBoxes, isContains, right, jj, numVertices);
        }
      } else {
        geometryRight.vertices.push(new THREE.Vector3(right.x(), right.y(), right.z()));
        if (anomalyMode && lane.rightPointValidity(jj) === 1) {
          rightAnomalies.push(new THREE.Vector3(right.x(), right.y(), right.z()));
        }
      }
    }

    for (let jj = 0, numVertices = lane.spineLength(); jj < numVertices; jj++) {
      await calcLoaded(jj, numVertices)
      const spine = lane.spine(jj);
      if (annotationMode) {
        // laneSpine.addMarker(new THREE.Vector3(spine.x(), spine.y(), spine.z()));
      } else {
        geometrySpine.vertices.push(new THREE.Vector3(spine.x(), spine.y(), spine.z()));
      }
    }

    if (annotationMode) {
      continue;
    }

    // // NOTE TRYING MESHLINE:
    // var leftLine = new MeshLine();
    // var spineLine = new MeshLine();
    // var rightLine = new MeshLine();
    //
    // leftLine.setGeometry(geometryLeft);
    // spineLine.setGeometry(geometrySpine);
    // rightLine.setGeometry(geometryRight);
    //
    // let leftMeshLineMaterial = new MeshLineMaterial();
    // // let spineMeshLineMaterial = new MeshLineMaterial();
    // // let rightMeshLineMaterial = new MeshLineMaterial();
    //
    // let leftMesh = new THREE.Mesh( leftLine.geometry, leftMeshLineMaterial );
    // // let spineMesh = new THREE.Mesh( spineLine.geometry, spineMeshLineMaterial );
    // // let rightMesh = new THREE.Mesh( rightLine.geometry, rightMeshLineMaterial );
    //
    // lefts.push(leftMesh);
    // // spines.push(spineMesh);
    // // rights.push(rightMesh);

    // NOTE TRYING BOXES:
    let firstCenter, center, lastCenter;
    // const vertices = geometryLeft.vertices;

    await createBoxes(geometryLeft.vertices, materialLeft);
    await createBoxes(geometrySpine.vertices, materialSpine);
    await createBoxes(geometryRight.vertices, materialRight);

    async function createBoxes(vertices, material) {
      for (let ii=1, len=vertices.length; ii<len; ii++) {
        await calcLoaded(ii, len)
        const tmp1 = vertices[ii-1];
        const tmp2 = vertices[ii];

        const p1 = new THREE.Vector3(tmp1.x, tmp1.y, tmp1.z);
        const p2 = new THREE.Vector3(tmp2.x, tmp2.y, tmp2.z);

        const length = Math.max(p1.distanceTo(p2), 0.001); // Clamp distance to min value of 1mm
        const height = 0.01;
        const width = 0.1;

        const vector = p2.sub(p1);
        const axis = new THREE.Vector3(1, 0, 0);
        center = p1.addScaledVector(vector, 0.5);
        if (lastCenter === undefined) {
          lastCenter = center.clone();
          firstCenter = center.clone();
        }
        // debugger; // lastCenter.sub(center) or center.sub(lastCenter);
        // let delta = lastCenter.clone().sub(center);
        // let delta = center.clone().sub(lastCenter);
        const delta = center.clone().sub(firstCenter);
        lastCenter = center.clone();
        // debugger; // delta
        // const geometry = new THREE.BoxGeometry(length, width, height);

        // for allBoxes:
        const boxGeometry = new THREE.BoxGeometry(length, width, height);
        const se3 = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, vector.clone().normalize());
        // debugger; // se3;
        se3.makeRotationFromQuaternion(quaternion); // Rotation
        se3.setPosition(delta); // Translation

        boxGeometry.applyMatrix( se3 );
        // TODO rotate boxGeometry.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
        allBoxes.merge(boxGeometry);

        if ((ii%100000)==0 || ii==(len-1)) {
          // let mesh = new THREE.Mesh(allBoxes, new THREE.MeshBasicMaterial({color:0x00ff00}));
          const mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(allBoxes), material); // Buffergeometry
          mesh.position.copy(firstCenter);
          all.push(mesh);
          allBoxes = new THREE.Geometry();
          firstCenter = center.clone();
        }
      }
    }

    // NOTE ORIGINAL:
    // lefts.push(new THREE.Line(geometryLeft, materialLeft) );
    // spines.push(new THREE.Line(geometrySpine, materialSpine) );
    // rights.push(new THREE.Line(geometryRight, materialRight) );
  }

  if (annotationMode) {
    if (volumes.length > 0) {
      all.push(leftLaneSegments);
      all.push(rightLaneSegments);
    } else {
      all.push(laneLeft);
      // all.push(laneSpine);
      all.push(laneRight);
    }
  }

  const output = {
    all: all,
    leftAnomalies: leftAnomalies,
    rightAnomalies: rightAnomalies
  };
  return output;
}

function updateSegments(laneSegments, clonedBoxes, prevIsContains, point, index, lengthArray) {

  let newIsContains = false;
  for (let bbi=0, bbLen=clonedBoxes.length; bbi<bbLen; bbi++) {
    const isContains = clonedBoxes[bbi].containsPoint(new THREE.Vector3(point.x(), point.y(), point.z()));
    if (isContains) {
      newIsContains = isContains;
    }
  }
  if (newIsContains && !prevIsContains) {
    laneSegments.initializeSegment("Lane Segment "); // can pass as a parameter and differentiate between left and right, but not required for now
  }
  if (!newIsContains && prevIsContains) {
    laneSegments.finalizeSegment();
  }

  if (newIsContains) {
    laneSegments.addSegmentMarker(new THREE.Vector3(point.x(), point.y(), point.z()));
  } else {
    laneSegments.incrementOffset(new THREE.Vector3(point.x(), point.y(), point.z()));
  }

  // edge case if a segment exists at the end
  if (newIsContains && index == lengthArray-1) {
    laneSegments.finalizeSegment();
  }

  return newIsContains
}


// Adds anomaly annotations
function addAnomalies (laneGeometries, lanesLayer) {
  const aRoot = viewer.scene.annotations;
  const aAnomalies = new Potree.Annotation({
    title: `${lanesLayer.name} Anomalies`,
    position: null,
    collapseThreshold: 0
  });
  aAnomalies.visible = false;
  aRoot.add(aAnomalies);

  if (laneGeometries.leftAnomalies.length !== 0) {
    aAnomalies.position = laneGeometries.leftAnomalies[0];
    const aLeft = new Potree.Annotation({
      title: 'Left',
      position: laneGeometries.leftAnomalies[0],
      collapseThreshold: 0
    });
    aAnomalies.add(addAnomaliesHelper(aLeft, laneGeometries.leftAnomalies, 'Left'));
  }

  if (laneGeometries.rightAnomalies.length !== 0) {
    aAnomalies.position = laneGeometries.rightAnomalies[0];
    const aRight = new Potree.Annotation({
      title: 'Right',
      position: laneGeometries.rightAnomalies[0],
      collapseThreshold: 0
    });
    aAnomalies.add(addAnomaliesHelper(aRight, laneGeometries.rightAnomalies, 'Right'));
  }
}

function addAnomaliesHelper (annotation, anomalies, name) {
  for (let ii = 0, len = anomalies.length; ii < len; ii++) {
    const point = anomalies[ii];
    const aAnomaly = new Potree.Annotation({
      title: `${name} ${ii + 1}`,
      position: point,
      cameraPosition: new THREE.Vector3(point.x, point.y, point.z + 20),
      cameraTarget: point
    });
    annotation.add(aAnomaly);
  }
  return annotation;
}

// Adds lane geometries to viewer
function addLaneGeometries (laneGeometries, lanesLayer) {
  for (let ii = 0, len = laneGeometries.all.length; ii < len; ii++) {
    lanesLayer.add(laneGeometries.all[ii]);
  }
  viewer.scene.scene.add(lanesLayer);

  // add lane anomaly geometries
  if (laneGeometries.leftAnomalies.length !== 0 ||
    laneGeometries.rightAnomalies.length !== 0) {
    addAnomalies(laneGeometries, lanesLayer);
  }
}


// Load Lanes Truth Data:
export async function loadLanesCallback (s3, bucket, name, callback, s3Files = null) {
  // Handle local file
  // TODO load original file too
  if (!s3Files) {
    loadLanesCallbackHelper(s3, bucket, name, 'lanes.fb', -1, callback, 'Lanes');
    // loadLanesCallbackHelper(s3, bucket, name, 'original-lanes.fb', 3, callback, 'Original Lanes');
  // Handle S3 files
  } else {
    // TODO remove and use s3Files parameter
    s3Files = await getFilesFromS3(s3, bucket, name, '2_Truth');
    for (let s3File of s3Files) {
      s3File = s3File.split(/.*[\/|\\]/)[1];
      if (!s3File.endsWith('lanes.fb')) {
        continue;
      } else if (s3File === 'lanes.fb') {
        loadLanesCallbackHelper(s3, bucket, name, s3File, -1, callback, 'Lanes');
      } else if (s3File === 'original-lanes.fb') {
        loadLanesCallbackHelper(s3, bucket, name, s3File, -1, callback, 'Original Lanes');
      } else {
        loadLanesCallbackHelper(s3, bucket, name, s3File, 3, callback, getLaneName(s3File));
      }
    }
  }

}

async function loadLanesCallbackHelper(s3, bucket, name, filename, tmpSupplierNum, callback, laneName) {
  await loadLanes(s3, bucket, name, filename, tmpSupplierNum, window.annotateLanesModeActive, viewer.scene.volumes, (laneGeometries) => {
    // need to have Annoted Lanes layer, so that can have original and edited lanes layers
    const lanesLayer = new THREE.Group();
    lanesLayer.name = laneName;
    addLaneGeometries(laneGeometries, lanesLayer);
    if (laneName !== 'Lanes') lanesLayer.visible = false;
    viewer.scene.dispatchEvent({
      type: "truth_layer_added",
      truthLayer: lanesLayer
    });
    if (callback) {
      callback();
    }
  });

  if (visualizationMode === "aptivLanes") {
    for (const s of [1, 2, 3]) {
      for (const d of ['EB', 'WB']) {
        for (const n of [1, 2, 3]) {
          const layerName = `Supplier${s}_${d}_Lane${n}`;
          const filename = `Supplier${s}_${d}_Lane${n}.fb`;
          loadLanesHelper(layerName, filename, s);
        }
      }
    }
    loadLanesHelper('TomTom', 'I-75-North_potree.fb', 1);
  }
  // Load Comparison Dataset (hardcoded to one for now)
  if (comparisonDatasets.length > 0) {
    filename = 'lanes.fb';
    tmpSupplierNum = -2;
    await loadLanes(s3, bucket, comparisonDatasets[0], filename, tmpSupplierNum, window.annotateLanesModeActive, viewer.scene.volumes, (laneGeometries) => {
      const lanesLayer = new THREE.Group();
      lanesLayer.name = `Lanes-${comparisonDatasets[0].split("Data/")[1]}`;
      addLaneGeometries(laneGeometries, lanesLayer);
      viewer.scene.dispatchEvent({
        type: "truth_layer_added",
        truthLayer: lanesLayer
      });
    });
  }
}


async function loadLanesHelper (layerName, filename, s) {
  try {
    await loadLanes(s3, bucket, name, filename, s, window.annotateLanesModeActive, viewer.scene.volumes, (laneGeometries) => {
      const lanesLayer = new THREE.Group();
      lanesLayer.name = layerName;
      addLaneGeometries(laneGeometries, lanesLayer);
      viewer.scene.dispatchEvent({
        type: 'map_provider_layer_added',
        mapLayer: lanesLayer
      });
    });
  } catch (e) {
    console.error(`Couldn't load ${filename}`, e);
  }
}

// add an event listener for the reload lanes button
export function addReloadLanesButton() {
  window.annotateLanesModeActive = false; // starts off false

  $("#reload_lanes_button")[0].style.display = "block"
  const reloadLanesButton = $("#reload_lanes_button")[0];
  reloadLanesButton.addEventListener("mousedown", () => {
    const proceed = window.annotateLanesModeActive ?
      confirm("Proceed? Lanes will be reloaded, so ensure that annotations have been saved if you want to keep them.") :
      true;

    if (proceed) {
      // REMOVE LANES
      let removeLanes = viewer.scene.scene.getChildByName("Lanes");
      while (removeLanes) {
        viewer.scene.scene.remove(removeLanes);
        removeLanes = viewer.scene.scene.getChildByName("Lanes");
      }

      // Pause animation:
      animationEngine.stop();

      // TOGGLE window.annotateLanesModeActive
      window.annotateLanesModeActive = !window.annotateLanesModeActive;

      // Disable Button:
      reloadLanesButton.disabled = true;

      // prepare for progress tracking (currently only triggered on button click)
      resetProgressBars(2) // have to download & process/load lanes

      loadLanesCallback(s3, bucket, name, () => {
        // TOGGLE BUTTON TEXT
        if (window.annotateLanesModeActive) {
          reload_lanes_button.innerText = "View Truth Lanes";
          document.getElementById("download_lanes_button").style.display = "block";
        } else {
          reload_lanes_button.innerText = "Annotate Truth Lanes";
          document.getElementById("download_lanes_button").style.display = "none";
        }
        reloadLanesButton.disabled = false;
      });
    }
  });
} // end of Reload Lanes Button Code

/**
 * @brief Function that gets the display name of a lane
 * @param { String } filename
 */
function getLaneName (filename) {
  return filename.split('.').slice(0, -1).join('.');
}

/**
 * @brief Function that gets the color scheme of the lanes to be rendered
 * @param { int } supplierNum
 */
function getLaneColorScheme (supplierNum) {
  let materialLeft, materialSpine, materialRight;
  switch (supplierNum) {
    case -2:
      materialLeft = new THREE.MeshBasicMaterial({ color: 0x11870a });
      materialSpine = new THREE.MeshBasicMaterial({ color: 0x11870a });
      materialRight = new THREE.MeshBasicMaterial({ color: 0x11870a });
      break;
    case 1:
      materialLeft = new THREE.MeshBasicMaterial({ color: 0x3aaeb7 });
      materialSpine = new THREE.MeshBasicMaterial({ color: 0x3aaeb7 });
      materialRight = new THREE.MeshBasicMaterial({ color: 0x3aaeb7 });
      break;
    case 2:
      materialLeft = new THREE.MeshBasicMaterial({ color: 0x3e3ab7 });
      materialSpine = new THREE.MeshBasicMaterial({ color: 0x3e3ab7 });
      materialRight = new THREE.MeshBasicMaterial({ color: 0x3e3ab7 });
      break;
    case 3:
      materialLeft = new THREE.MeshBasicMaterial({ color: 0xa63ab7 });
      materialSpine = new THREE.MeshBasicMaterial({ color: 0xa63ab7 });
      materialRight = new THREE.MeshBasicMaterial({ color: 0xa63ab7 });
      break;
    default:
      materialLeft = new THREE.MeshBasicMaterial({ color: 0xffffff });
      materialSpine = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      materialRight = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }
  return [materialLeft, materialRight, materialSpine];
}
