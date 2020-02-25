import { getLoadingBar, removeLoadingScreen } from "../common/overlay.js";
import { RtkTrajectory } from "../demo/RtkTrajectory.js";
import { applyRotation } from "../demo/rtkLoader.js";
import { visualizationMode } from  "../demo/paramLoader.js"; 

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
		const closedPath = false;

		// CREATE VEHICLE OBJECT:
		// NOTE for Mustang: {texture: models/bodybkgd.JPG, mesh: models/1967-shelby-ford-mustang.obj}
		// NOTE for Volt: {texture: models/Chevy_Volt_Segmented/Chevrolet_Volt_v1_exterior.png, mesh: resources/models/Chevy_Volt_Segmented/Chevy_Volt_2016.obj}
		let manager = new THREE.LoadingManager();
		manager.onProgress = function (item, loaded, total) {
			console.log(item, loaded, total);
		};
		let textureLoader = new THREE.TextureLoader(manager);
		let texture = textureLoader.load(`${Potree.resourcePath}/models/Chevy_Volt_Segmented/reflection_1.png`);
		// let texture = textureLoader.load(`${Potree.resourcePath}/models/bodybkgd.JPG`);
		let onProgress = function (xhr) {
			if (xhr.lengthComputable) {
				let percentComplete = xhr.loaded / xhr.total * 100;
			}
		};
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		let geometry = new THREE.SphereGeometry(2, 32, 32);
		let material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide, opacity: 0.92, transparent: true });
		let sphere = new THREE.Mesh(geometry, material);
		sphere.position.copy(new THREE.Vector3(...pos[0]));
		// viewer.scene.scene.add( sphere );


		{ // Load Textured vehicle from obj
			let onError = function (xhr) { };
			let loader = new THREE.OBJLoader(manager);
			loader.load(`${Potree.resourcePath}/models/Chevy_Volt_Segmented/volt_reduce.obj`,
				// loader.load(`${Potree.resourcePath}/models/Chevy_Volt_Segmented/Chevy_Volt_2016.obj`,
				function (object) {
					object.traverse(function (child) {
						if (child instanceof THREE.Mesh) {
							child.material.map = texture;
						}
					});

					const vehicleGroup = new THREE.Group();
					vehicleGroup.name = "Vehicle";

					{ // render the path
						let geometry = new THREE.Geometry();
						for (let ii = 0; ii < rtkTrajectory.numStates; ii++) {
							geometry.vertices[ii] = rtkTrajectory.states[ii].pose.clone();
						}
						let material = new THREE.LineBasicMaterial({ color: new THREE.Color(0x00ff00) });
						material.uniforms = { initialTime: { value: t_init } };
						// material.opacity = 0.0;
						// material.transparent = true;
						let line = new THREE.Line(geometry, material, { closed: closedPath });
						line.name = "RTK Trajectory";
						line.visible = false;
						viewer.scene.scene.add(line);
						viewer.scene.dispatchEvent({ "type": "vehicle_layer_added", "vehicleLayer": line });
					}

					// Add Polar Grid Helper:
					const gridRadius = 100; // meters
					const gridSpacing = 5; // meters
					const scaleFactor = 1; // HACK for now because attached to vehicle mesh which is 1/100th scale
					const gridHelper = new THREE.GridHelper(scaleFactor * 2 * gridRadius, 2 * gridRadius / gridSpacing, 0x0000ff, 0x808080);
					gridHelper.name = "Cartesian Grid";
					gridHelper.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
					gridHelper.position.z -= 2;
					gridHelper.visible = false;
					viewer.scene.dispatchEvent({ "type": "vehicle_layer_added", "vehicleLayer": gridHelper });
					const polarGridHelper = new THREE.PolarGridHelper(scaleFactor * gridRadius, 16, gridRadius / gridSpacing, 64, 0x0000ff, 0x808080);
					polarGridHelper.name = "Polar Grid";
					polarGridHelper.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
					polarGridHelper.position.z -= 2;
					polarGridHelper.visible = false;
					viewer.scene.dispatchEvent({ "type": "vehicle_layer_added", "vehicleLayer": polarGridHelper });
					const axesHelper = new THREE.AxesHelper(scaleFactor * gridSpacing);
					axesHelper.name = "3D Axes";
					axesHelper.position.z -= 2;
					// axesHelper.rotateOnAxis(new THREE.Vector3(0,0,1), -Math.PI/2);
					axesHelper.visible = false;
					viewer.scene.dispatchEvent({ "type": "vehicle_layer_added", "vehicleLayer": axesHelper });


					vehicleGroup.add(gridHelper);
					vehicleGroup.add(polarGridHelper);
					vehicleGroup.add(axesHelper);

					// Apply RTK to Vehicle Mesh Extrinsics:
					object.name = "Vehicle Mesh";
					object.scale.multiplyScalar(.01);
					object.rotation.set(0 * Math.PI / 2, 0 * Math.PI / 2., 1 * Math.PI / 2.0); // Chevy Volt
					object.position.sub(new THREE.Vector3(0, 0, 2)); // Chevy Volt

					// Initialize Vehicle Group:
					vehicleGroup.position.set(...pos[0]);
					applyRotation(vehicleGroup, rot[0][0], rot[0][1], rot[0][2]);
					vehicleGroup.rotation.set(...rot[0]);
					vehicleGroup.rtkTrajectory = rtkTrajectory;
					vehicleGroup.add(object);

					// TODO New Camera Initialization:
					let box = new THREE.Box3().setFromObject(vehicleGroup);
					let node = new THREE.Object3D();
					node.boundingBox = box;
					viewer.zoomTo(node, 0.1, 500);
					// viewer.scene.view.lookAt(object.position);

					// viewer.scene.scene.add( object );
					viewer.scene.scene.add(vehicleGroup);
					viewer.scene.dispatchEvent({ "type": "vehicle_layer_added", "vehicleLayer": object });

					viewer.setFilterGPSTimeRange(0, 0); // Size 0 Time Window at start of timeline
					removeLoadingScreen();
				}, onProgress, onError);
		}

		// ANIMATION:
		{ // create Animation Path & make light follow it
			{// ANIMATION + SLIDER LOGIC:
				let slider = document.getElementById("myRange");
				let time_display = document.getElementById("time_display");
				let tmin = document.getElementById("playbar_tmin");
				let tmax = document.getElementById("playbar_tmax");
				let zmin = document.getElementById("elevation_min");
				let zmax = document.getElementById("elevation_max");
				time_display.value = Math.round(10000 * slider.value) / 10000;

				// Playbar Button Functions:
				let playbutton = document.getElementById("playbutton");
				let pausebutton = document.getElementById("pausebutton");
				pausebutton.addEventListener("mousedown", () => {
					animationEngine.stop();
				});
				playbutton.addEventListener("mousedown", () => {
					animationEngine.start();
				});


				time_display.addEventListener('keyup', function onEvent(e) {
					if (e.keyCode === 13) {
						console.log('Enter')
						animationEngine.stop();
						let val = parseFloat(time_display.value);
						val = Math.max(0, val);
						val = Math.min(animationEngine.timeRange - .001, val);
						animationEngine.timeline.t = val + animationEngine.tstart;
						animationEngine.updateTimeForAll();
					}
				});

				slider.addEventListener("input", () => {
					animationEngine.stop();
					var val = slider.value / 100.0;
					animationEngine.timeline.t = val * animationEngine.timeRange + animationEngine.tstart;
					animationEngine.updateTimeForAll();
				});

				slider.addEventListener("wheel", () => {
					animationEngine.stop();
					var val = slider.value / 100.0;
					animationEngine.timeline.t = val * animationEngine.timeRange + animationEngine.tstart;
					animationEngine.updateTimeForAll();
				});

				zmin.addEventListener("input", () => {
					window.elevationWindow.min = Math.abs(Number(zmin.value));
					window.elevationWindow.max = Math.abs(Number(zmax.value));
					animationEngine.updateTimeForAll();
				});

				zmax.addEventListener("input", () => {
					window.elevationWindow.min = Math.abs(Number(zmin.value));
					window.elevationWindow.max = Math.abs(Number(zmax.value));
					animationEngine.updateTimeForAll();
				});
			}

		}
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