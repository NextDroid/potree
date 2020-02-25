import { getLoadingBar, removeLoadingScreen } from "../common/overlay.js";
import { RtkTrajectory } from "../demo/RtkTrajectory.js";
import { applyRotation } from "../demo/rtkLoader.js";
import { visualizationMode } from  "../demo/paramLoader.js"; 
import { loadTexture } from "../demo/textureLoader.js";
import { createSliderListeners } from "../common/playbar.js"

export async function loadRtkFlatbuffer(s3, bucket, name, callback) {
  let lastLoaded = 0;
  if (s3 && bucket && name) {
    const objectName = `${name}/0_Preprocessed/rtk.fb`;
    const schemaFile = `${name}/5_Schemas/RTK_generated.js`;

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
                     // const string = new TextDecoder().decode(data.Body);
                     // const {mpos, orientations, t_init, t_range} = parseRTK(string);
                     const FlatbufferModule = await import(schemaUrl);
                     const {mpos, orientations, timestamps, t_init, t_range} = parseRTK(data.Body, FlatbufferModule);
                     callback(mpos, orientations, timestamps, t_init, t_range);
                   }});
    request.on("httpDownloadProgress", (e) => {
      let loadingBar = getLoadingBar();
      let val = 100*(e.loaded/e.total);
      val = Math.max(lastLoaded, val);
      loadingBar.set(val);
      lastLoaded = val;
    });

  } else {

    const filename = "../data/rtk.fb";
    const schemaFile = "../schemas/RTK_generated.js";
    let t0, t1;
    const tstart = performance.now();

    const xhr = new XMLHttpRequest();
    xhr.open("GET", filename);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = function(event) {
      t1 = performance.now();
      t0 = t1;
    }

    xhr.onload = async function(data) {

      const FlatbufferModule = await import(schemaFile);

      let uint8Array = new Uint8Array(data.target.response);

      const {mpos, orientations, timestamps, t_init, t_range} = parseRTK(uint8Array, FlatbufferModule);
      callback(mpos, orientations, timestamps, t_init, t_range);
    };

    t0 = performance.now();
    xhr.send();
  }
}

function parseRTK(bytesArray, FlatbufferModule) {
  const t0_loop = performance.now();

  let numBytes = bytesArray.length;
  let rtkPoses = [];
  let mpos = [];
  let timestamps = [];
  let orientations = [];
  let adjustedOrientations = [];
  let allAdjustedOrientationsAreZero = true;
  let t_init, t_range;
  let count = 0;

  let segOffset = 0;
  let segSize, viewSize, viewData;
  while (segOffset < numBytes) {

    // Read SegmentSize:
    viewSize = new DataView(bytesArray.buffer, segOffset, 4);
    segSize = viewSize.getUint32(0, true); // True: little-endian | False: big-endian

    // Get Flatbuffer RTK Pose Object:
    segOffset += 4;
    let buf = new Uint8Array(bytesArray.buffer.slice(segOffset, segOffset+segSize));
    let fbuffer = new flatbuffers.ByteBuffer(buf);
    let rtkPosesFB = FlatbufferModule.Flatbuffer.RTK.Poses.getRootAsPoses(fbuffer);

    // Extract RTK Pose Information:
    const epsilonSec = 0.01;
    for (let ii = 0, numPoses = rtkPosesFB.posesLength(); ii < numPoses; ii++) {
      let pose = rtkPosesFB.poses(ii);

      if (pose.timestamp() < epsilonSec) { // (!pose.isValid()) {
        continue;
      }

      if (count == 0)  {
        t_init = pose.timestamp();
      }
      t_range = pose.timestamp() - t_init;

      // Get UTM Position Data:
      if (pose.locXY) {
        mpos.push( [pose.locXY().x(), pose.locXY().y(), pose.pos().z()] );
      } else {
        mpos.push( [pose.utm().x(), pose.utm().y(), pose.utm().z()] );
      }

      // Get Orientation Data:
      if (pose.orientation) {
        orientations.push( [pose.orientation().z(), pose.orientation().y(), pose.orientation().x()] );
        window.usingAdjustedHeading = false;
      } else {
        orientations.push( [pose.roll(), pose.pitch(), pose.utm().yaw()] ); // TODO USE UTM-ADJUSTED ROLL/PITCH EVENTUALLY
        window.usingAdjustedHeading = true;
      }

      timestamps.push(pose.timestamp());

      count += 1;
    }

    if (!window.usingAdjustedHeading) {
      console.error("NOT USING ADJUSTED HEADING FOR RTK POSES");
    }

    // rtkPoses.push(pose);
    segOffset += segSize;
  }

  return {mpos, orientations, timestamps, t_init, t_range};
}

// Load RTK: TODO REFACTOR THIS (a lot of stuff happenning here, break it up if possible)
// utilizes loadRtkFlatbuffer and adds callbacks to it
export function loadRtkCallback(s3, bucket, name, callback) {
	// loadRtk(s3, bucket, name, (pos, rot, timestamps, t_init, t_range) => {
	loadRtkFlatbuffer(s3, bucket, name, (pos, rot, timestamps, t_init, t_range) => {
		window.timeframe = { "tstart": t_init, "tend": t_init + t_range };

		// TODO Move this into main loader function:
		let tstart = window.timeframe.tstart;	// Set in loadRtkCallback
		let tend = window.timeframe.tend;			// Set in loadRtkCallback
		let playbackRate = 1.0;
		animationEngine.configure(tstart, tend, playbackRate);
		animationEngine.launch();

		if (callback) {
			callback();
		}

		const path = pos.map(v => new THREE.Vector3(...v));
		const orientations = rot.map(v => new THREE.Vector3(...v));
		const samplingFreq = 100; // Hertz TODO hardcoded
		const rtkTrajectory = new RtkTrajectory(path, orientations, timestamps, samplingFreq);

		// load the texture for car
		loadTexture(rtkTrajectory, pos, rot);

		// create event listeners that animate the playbar
		createSliderListeners();

	});


	// RTK TweenTarget Callback:
	window.updateCamera = true;
	window.pitchThreshold = 1.00;
	window.elevationWindow = { min: 1, max: 1, z: 0 };
	animationEngine.tweenTargets.push((gpsTime) => {
		try {
			let t = (gpsTime - animationEngine.tstart) / (animationEngine.timeRange);
			let vehicle = viewer.scene.scene.getObjectByName("Vehicle");
			let mesh = vehicle.getObjectByName("Vehicle Mesh");
			let lastRtkPoint = vehicle.position.clone();
			let lastRtkOrientation = vehicle.rotation.clone();
			let lastTransform = vehicle.matrixWorld.clone();
			// debugger; //vehicle
			let state = vehicle.rtkTrajectory.getState(gpsTime);
			let rtkPoint = state.pose.clone();
			let vehicleOrientation = state.orient.clone();
			vehicle.position.copy(rtkPoint);
			if (visualizationMode == "aptivLanes") {
				vehicle.position.add(new THREE.Vector3(0, 0, 1000));
			}
			applyRotation(vehicle, vehicleOrientation.x, vehicleOrientation.y, vehicleOrientation.z);
			vehicle.updateMatrixWorld();

			// Apply Transformation to Camera and Target:
			if (window.updateCamera) {
				let newTransform = vehicle.matrixWorld.clone();
				let lastTransformInverse = lastTransform.getInverse(lastTransform);
				let deltaTransform = lastTransformInverse.premultiply(newTransform);
				let target = viewer.scene.view.position.clone();
				let direction = viewer.scene.view.direction.clone();
				let radius = viewer.scene.view.radius;
				target.add(direction.multiplyScalar(radius));
				viewer.scene.view.position.applyMatrix4(deltaTransform);
				if (Math.abs(viewer.scene.view.pitch) < window.pitchThreshold) {
					viewer.scene.view.lookAt(target.applyMatrix4(deltaTransform));
				}
			}

			// Set Elevation:
			// let elevationDeltaMin = -0;
			// let elevationDeltaMax = 2;
			let clouds = viewer.scene.pointclouds;
			for (let ii = 0, numClouds = clouds.length; ii < numClouds; ii++) {
				let zheight = mesh.matrixWorld.getPosition().z;
				window.elevationWindow.z = zheight;
				viewer.scene.pointclouds[ii].material.elevationRange = [window.elevationWindow.z - window.elevationWindow.min, window.elevationWindow.z + window.elevationWindow.max];
				// TODO set elevation slider range extent
			}

			// Save Current RTK Pose in Uniforms:
			for (let ii = 0, numClouds = clouds.length; ii < numClouds; ii++) {
				let material = clouds[ii].material;
				material.uniforms.currentRtkPosition.value = state.pose.clone();
				material.uniforms.currentRtkOrientation.value = state.orient.toVector3().clone();
			}
		} catch (e) {
			console.error("Caught error: ", e);
		}
	});
}