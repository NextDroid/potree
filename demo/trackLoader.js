"use strict"
// import { Flatbuffer } from "../schemas/GroundTruth_generated.js";
// import { Flatbuffer } from "http://localhost:1234/schemas/GroundTruth_generated.js";
import { updateLoadingBar, incrementLoadingBarTotal } from "../common/overlay.js";
import { getFbFileInfo, removeFileExtension, indexOfClosestTimestamp } from "./loaderUtilities.js";


// sets local variable and returns so # files can be counted
let trackFiles = null;
export const trackDownloads = async (datasetFiles) => {
  trackFiles = await getFbFileInfo(datasetFiles,
                                   "tracks.fb",
                                   "2_Truth",
                                   "GroundTruth_generated.js", // 5_Schemas
                                   "../data/tracks.fb",
                                   "../schemas/GroundTruth_generated.js");
  return trackFiles;
}

export async function loadTracks(s3, bucket, name, trackFileName, shaderMaterial, animationEngine, callback) {
  const tstart = performance.now();
  if (!trackFiles) {
    console.log("No track files present")
    return
  }

  if (trackFileName) {
    trackFiles.objectName = `${name}/2_Truth/${trackFileName}`;
  }
  console.log("tracks", trackFileName);
  console.log("tracks load", trackFiles.objectName);
  if (s3 && bucket && name) {
    (async () => {
      const schemaUrl = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: trackFiles.schemaFile
      });
      const request = await s3.getObject({Bucket: bucket,
        Key: trackFiles.objectName},
        async (err, data) => {
          if (err) {
            console.error("Error getting tracks file", err, err.stack);
          } else {
            const FlatbufferModule = await import(schemaUrl);
            const trackGeometries = await parseTracks(data.Body, shaderMaterial, FlatbufferModule, animationEngine);
            await callback(trackGeometries, );
          }
          incrementLoadingBarTotal("tracks loaded")
        });
      request.on("httpDownloadProgress", async (e) => {
        await updateLoadingBar(e.loaded/e.total * 100);
      });

      request.on("complete", () => {
        incrementLoadingBarTotal("tracks downloaded")
      });
    })();

  } else {
    let t0, t1;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", trackFiles.objectName);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = async (e) => {
      await updateLoadingBar(e.loaded/e.total*100)
      t1 = performance.now();
      t0 = t1;
    }

    xhr.onload = async (data) => {
      incrementLoadingBarTotal("tracks downloaded")
      const FlatbufferModule = await import(trackFiles.schemaFile);

      const response = data.target.response;
      if (!response) {
        console.error("Could not create buffer from tracks data");
        return;
      }

      let bytesArray = new Uint8Array(response);
      const trackGeometries = await parseTracks(bytesArray, shaderMaterial, FlatbufferModule, animationEngine);
      await callback(trackGeometries, );
      incrementLoadingBarTotal("tracks loaded")
    };

    t0 = performance.now();
    xhr.send();
  }
}

//
// function loadTracks(shaderMaterial, callback) {
//
//   filename = "../data/tracks.bin";
//
//   const xhr = new XMLHttpRequest();
//   xhr.open("GET", filename);
//   xhr.responseType = "arraybuffer";
//   xhr.onprogress = function(event) {
//     console.log("TRACKS -- Loaded ["+event.loaded+"] bytes")
//   }
//
//   xhr.onerror = function(e) {
//     console.error("TRACKS -- Error loading tracks: ", e);
//   }
//
//   xhr.onload = function() {
//     const trackGeometries = parseTracks(data.target.response, shaderMaterial);
//     callback(trackGeometries, );
//   }
//   xhr.send();
// }

async function parseTracks(bytesArray, shaderMaterial, FlatbufferModule, animationEngine) {

  let numBytes = bytesArray.length;
  let tracks = [];

  let segOffset = 0;
  let segSize, viewSize, viewData;
  while (segOffset < numBytes) {

    // Read SegmentSize:
    viewSize = new DataView(bytesArray.buffer, segOffset, 4);
    segSize = viewSize.getUint32(0, true); // True: little-endian | False: big-endian

    // Get Flatbuffer Track Object:
    segOffset += 4;
    let buf = new Uint8Array(bytesArray.buffer.slice(segOffset, segOffset+segSize));
    let fbuffer = new flatbuffers.ByteBuffer(buf);
    let track = FlatbufferModule.Flatbuffer.GroundTruth.Track.getRootAsTrack(fbuffer);
    // debugger;

    tracks.push(track);
    segOffset += segSize;
  }

  return await createTrackGeometries(shaderMaterial, tracks, animationEngine);
  // callback(trackGeometries, );
}

function getTrackMeshParams(state, timeDelta) {
  let sumX = 0, sumY = 0, sumZ = 0;

  for (let i = 0; i < 8; i++) {
    let bbox = state.bbox(i);
    sumX += bbox.x();
    sumY += bbox.y();
    sumZ += bbox.z();
  }

  const centroidLocation = new THREE.Vector3(sumX / 8.0, sumY / 8.0, sumZ / 8.0 );

  const p0 = new THREE.Vector3(state.bbox(0).x(), state.bbox(0).y(), state.bbox(0).z()); // Front Left Bottom Point (near front left tire on vehicle e.g.)
  const p1 = new THREE.Vector3(state.bbox(1).x(), state.bbox(1).y(), state.bbox(1).z()); // Front Right Bottom Point (near front right tire on vehicle e.g.)
  const p2 = new THREE.Vector3(state.bbox(2).x(), state.bbox(2).y(), state.bbox(2).z()); // Back Right Bottom Point (near back right tire on vehicle e.g.)

  const length = p2.distanceTo(p1);
  const width = p1.distanceTo(p0);
  const height = 2;

  const yaw = state.yaw();
  const timestamp = state.timestamps() - timeDelta;

  return { centroidLocation, length, width, height, yaw, timestamp };
}

async function createTrackGeometries(shaderMaterial, tracks, animationEngine) {
  const trackMeshes = [];

  for (let ss=0, numTracks=tracks.length; ss<numTracks; ss++) {
    if (ss % 100 === 0) {
      await updateLoadingBar(ss/numTracks * 100);
    }

    let track = tracks[ss];

    const trackGeometry = new THREE.BoxBufferGeometry();
    const trackWireframe = new THREE.EdgesGeometry(trackGeometry);
    const trackMesh = new THREE.LineSegments(trackWireframe, shaderMaterial.clone());

    trackMesh.track_id = track.id();
    trackMeshes.push({mesh: trackMesh, states: []});

    for (let ii=0, len=track.statesLength(); ii<len; ii++) {
      // Assign Current Track State:
      const state = track.states(ii);

      const { centroidLocation, length, width, height, yaw, timestamp } = getTrackMeshParams(state, animationEngine.tstart);

      const zAxis = new THREE.Vector3(0, 0, 1);
      const trackQuaternion = new THREE.Quaternion().setFromAxisAngle(zAxis, yaw);
      const trackScale = new THREE.Vector3(length, width, height);

      trackMeshes[ss].states.push({position: centroidLocation, quaternion: trackQuaternion, scale: trackScale, timestamp});
    }
  }

  trackMeshes.forEach(({states}, i) => {
    states.sort((a, b) => a.timestamp - b.timestamp);
    trackMeshes[i].timeRange = { min: states[0].timestamp, max: states[states.length - 1].timestamp };
  });

  await updateLoadingBar(100);
  return { trackMeshes };
}

export async function loadTracksCallback(s3, bucket, name, trackShaderMaterial, animationEngine, files) {
  if (files) {
    for (let file of files) {
      file = file.split(/.*[\/|\\]/)[1];
      if (!file.endsWith('tracks.fb')) {
        continue;
      } else if (file === 'tracks.fb') {
        loadTracksCallbackHelper(s3, bucket, name, trackShaderMaterial, animationEngine, file, 'Tracked Objects');
      } else {
        const newTrackShaderMaterial = trackShaderMaterial.clone();
        newTrackShaderMaterial.uniforms.color.value = getTrackColor(file);
        loadTracksCallbackHelper(s3, bucket, name, newTrackShaderMaterial, animationEngine, file, getTrackName(file));
      }
    }
  } else {
    loadTracksCallbackHelper(s3, bucket, name, trackShaderMaterial, animationEngine, 'tracks.fb', 'Tracked Objects');
  }
}

async function loadTracksCallbackHelper (s3, bucket, name, trackShaderMaterial, animationEngine, trackFileName, trackName) {
	await loadTracks(s3, bucket, name, trackFileName, trackShaderMaterial, animationEngine, (trackGeometries) => {
		const trackLayer = new THREE.Group();
    trackLayer.name = trackName;
    trackLayer.visible = trackName === 'Tracked Objects'
    trackGeometries.trackMeshes.forEach((track, i) => trackLayer.add(trackGeometries.trackMeshes[i].mesh));

		viewer.scene.scene.add(trackLayer);
		const e = new CustomEvent("truth_layer_added", { detail: trackLayer, writable: true });
		viewer.scene.dispatchEvent({
			"type": "truth_layer_added",
			"truthLayer": trackLayer
    });

    if (trackLayer.name === 'Tracked Objects') {
      let onMouseDown = (event) => {
        if (event.button === THREE.MOUSE.LEFT) {
          const currentAnnotation = viewer.scene.annotations.children.find(({_title}) => _title.startsWith("Track ID: "));
          if (currentAnnotation) viewer.scene.annotations.remove(currentAnnotation)

          let mouse = new THREE.Vector2();
          mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

          let raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse.clone(), viewer.scene.getActiveCamera());

          let intersects = raycaster.intersectObjects(trackLayer.children, true);
          if (intersects?.length > 0) {
            viewer.scene.annotations.add(new Potree.Annotation({
              title: "Track ID: " + intersects[0].object.track_id,
              position: intersects[0].point
            }));
          }
        }
      }
      viewer.renderer.domElement.addEventListener('mousedown', onMouseDown);
    }

		// TODO check if group works as expected, then trigger "truth_layer_added" event
		animationEngine.tweenTargets.push((gpsTime) => {
      const currentTime = gpsTime - animationEngine.tstart;
      const minTime = currentTime + animationEngine.activeWindow.backward;
      const maxTime = currentTime + animationEngine.activeWindow.forward;

			trackShaderMaterial.uniforms.minGpsTime.value = minTime;
      trackShaderMaterial.uniforms.maxGpsTime.value = maxTime;

      trackGeometries.trackMeshes.forEach(({states, timeRange}, i) => {
        if (currentTime >= timeRange.min && currentTime <= timeRange.max) {
          const currentState = states[indexOfClosestTimestamp(states, currentTime)];

          trackGeometries.trackMeshes[i].mesh.visible = true;
          trackGeometries.trackMeshes[i].mesh.position.copy(currentState.position);
          trackGeometries.trackMeshes[i].mesh.quaternion.copy(currentState.quaternion);
          trackGeometries.trackMeshes[i].mesh.scale.copy(currentState.scale);
        }
        else {
          trackGeometries.trackMeshes[i].mesh.visible = false;
        }
      });
		});
	});
}  // end of loadTracksCallback

function getTrackName(file) {
  return (file in trackNames) ? trackNames[file] : removeFileExtension(file);
}

function getTrackColor (file) {
  return (file in trackColors) ? trackColors[file] : new THREE.Color(0xFFFF00);
}

const trackColors = {
  'srr_detects_association_regions_tracks.fb': new THREE.Color(0xB967FF), // P
  'srr_detects_interpolated_states_tracks.fb': new THREE.Color(0xB967FF), // P
  'mrr_detects_association_regions_tracks.fb': new THREE.Color(0xFF7400), // O
  'mrr_detects_interpolated_states_tracks.fb': new THREE.Color(0xFF7400), // O
  'srr_tracks_association_regions_tracks.fb': new THREE.Color(0x0000FF),  // B
  'srr_tracks_interpolated_states_tracks.fb': new THREE.Color(0x0000FF),  // B
  'mrr_tracks_association_regions_tracks.fb': new THREE.Color(0x006400), // G
  'mrr_tracks_interpolated_states_tracks.fb': new THREE.Color(0x006400), // G
};

const trackNames = {
  'srr_detects_association_regions_tracks.fb': "SRR Detects Association Regions",
  'srr_detects_interpolated_states_tracks.fb': "SRR Detects Interpolated States",
  'mrr_detects_association_regions_tracks.fb': "MRR Detects Association Regions",
  'mrr_detects_interpolated_states_tracks.fb': "MRR Detects Interpolated States",
  'srr_tracks_association_regions_tracks.fb': "SRR Tracklets Association Regions",
  'srr_tracks_interpolated_states_tracks.fb': "SRR Tracklets Interpolated States",
  'mrr_tracks_association_regions_tracks.fb': "MRR Tracklets Association Regions",
  'mrr_tracks_interpolated_states_tracks.fb': "MRR Tracklets Interpolated States",
};
