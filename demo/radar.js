import { loadLanes } from '../demo/laneLoader.js';
import { loadTracks } from '../demo/trackLoader.js';
import { loadDetections } from '../demo/detectionLoader.js';
import { applyRotation } from '../demo/rtkLoader.js';
import { loadRtkFlatbuffer } from '../demo/rtkLoaderFlatbuffer.js';
import { RtkTrajectory } from '../demo/RtkTrajectory.js';
import { loadRadar } from '../demo/radarLoader.js';
import { loadGaps } from '../demo/gapsLoader.js';
import { loadRem } from '../demo/remLoader.js';
import { loadRtk2Vehicle, loadVelo2Rtk } from '../demo/calibrationManager.js';
import { togglePointClass, updateSidebar } from '../common/custom-sidebar.js';
// import {  } from "../common/overlay.js";
import { removeLoadingScreen, setLoadingScreen } from '../common/overlay.js';
import { PointAttributeNames } from '../src/loader/PointAttributes.js';

// setLoadingScreen();

const runForLocalDevelopment = location.search === '' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const params = new URLSearchParams(location.search);
const bucket = params.get('bucket');
const region = params.get('region');
const names = JSON.parse(params.get('names'));
const name = params.get('clicked');
const visualizationMode = params.get('mode');
const annotateLanesAvailable = params.get('annotate') === 'Annotate';
const downloadLanesAvailable = annotateLanesAvailable;
const calibrationModeAvailable = params.get('calibrate') === 'Calibrate' || runForLocalDevelopment;
const accessKeyId = params.get('key1');
const secretAccessKey = params.get('key2');
const sessionToken = params.get('key3');
const fonts = JSON.parse(params.get('fonts'));
const theme = JSON.parse(params.get('theme')); // material-ui theme
let comparisonDatasets = [];
if (names) {
  comparisonDatasets = names.filter(element => element !== name);
}

if (fonts) {
  const head = document.head;
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = font;
    head.appendChild(link);
  });

  // Override fonts specified.
  const { typography } = theme;
  const style = document.createElement('style');
  style.innerHTML =
    `#value {font-family: ${typography.fontFamily} !important;} #sidebar_root {font-family: ${typography.fontFamily} !important;} #potree_languages {font-family: ${typography.fontFamily} !important;}`;
  head.appendChild(style);
}

const s3 = bucket && region && name && accessKeyId && secretAccessKey && new AWS.S3({
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  sessionToken: sessionToken
});

if (!(s3 || window.location.hostname === 'localhost' || window.location.hostname ===
  '127.0.0.1')) { window.history.back(); }

// We really want this, but it doesn't work in the browser. Only on a server.
// const stream = s3.getObject({Bucket: bucket,
//                              Key: name}).createReadStream();

window.viewer = new Potree.Viewer(document.getElementById('potree_render_area'));

viewer.setEDLEnabled(true);
viewer.setFOV(60);
viewer.setPointBudget(1 * 1000 * 1000);
document.title = '';
viewer.setEDLEnabled(false);
viewer.setBackground('gradient'); // ["skybox", "gradient", "black", "white"];
viewer.setDescription(``);
viewer.loadSettingsFromURL();

viewer.loadGUI(() => {
  // Override Sidebar Potree Branding Panel:
  document.getElementById('potree_branding').style.display = 'none';
  document.getElementById('menu_about').style.display = 'none';

  viewer.setLanguage('en');
  $('#menu_appearance').next().show();
  $('#menu_tools').next().show();
  $('#menu_scene').next().show();
  // viewer.toggleSidebar();
  // viewer.setNavigationMode(EarthControls); // TODO Hack: changed default in viewer.js line 234
  // $('#show_bounding_box').trigger("click");
  // $("#splat_quality_options_hq").trigger("click"); // NOTE: HQ Splat breaks OrthographicCamera
  // viewer.scene.view.position.set(300198.109, 4701144.537, 349.871);
  // viewer.scene.view.lookAt(new THREE.Vector3(299900.954, 4701576.919, 66.197));
  updateSidebar(visualizationMode);

  window.calibrationModeAvailable = calibrationModeAvailable;
  document.getElementById('toggle_calibration_panels').style.display =
    window.calibrationModeAvailable ? 'block' : 'none';

  if (visualizationMode == 'aptivLanes') {
    viewer.setCameraMode(Potree.CameraMode.ORTHOGRAPHIC);
    viewer.scene.view.maxPitch = -Math.PI / 2;

    document.getElementById('playback_speed').style.display = 'none';
    document.getElementById('toggleslider').style.display = 'none';
    document.getElementById('toggle_calibration_panels').style.display = 'none';
    document.getElementById('load_detections_button').style.display = 'none';
    document.getElementById('load_radar_button').style.display = 'none';
    document.getElementById('load_gaps_button').style.display = 'none';
    document.getElementById(
      'camera_projection_options').children[0].children[1].children[0].style.display = 'none'; // Hide
                                                                                               // projective
                                                                                               // camera
                                                                                               // option
  }

  // Disable download lanes
  if (!downloadLanesAvailable || !annotateLanesAvailable) {
    let downloadLanesButton = document.getElementById('download_lanes_button');
    downloadLanesButton.parentNode.removeChild(downloadLanesButton);

    if (!annotateLanesAvailable) {
      let reloadLanesButton = document.getElementById('reload_lanes_button');
      reloadLanesButton.parentNode.removeChild(reloadLanesButton);
    }
  }

  // Check if Classification Attribute is exists in PointCloud:
  try {
    let pointcloud = viewer.scene.pointclouds[0];
    togglePointClass(pointcloud);
  } catch (e) {
    console.log('Sidebar initialized pointcloud loaded: ', e);
  }
});

// Create AnimationEngine:
window.animationEngine = new AnimationEngine();

// TODO put these material definitions somewhere better
let uniforms = {
  color: { value: new THREE.Color(0x00ff00) },
  minGpsTime: { value: 0.0 },
  maxGpsTime: { value: 0.5 },
  initialTime: { value: 0 } // TODO not used
  // offset: {value: new THREE.Vector3(0,0,0)}
};
let shaderMaterial = new THREE.ShaderMaterial({

  uniforms: uniforms,
  vertexShader: document.getElementById('vertexshader').textContent,
  fragmentShader: document.getElementById('fragmentshader').textContent,
  transparent: true,
  depthWrite: false

});

// Playbar Configuration:
$(document).ready(() => {
  document.getElementById('playbar_tmax').disabled = false;
  document.getElementById('playbar_tmin').disabled = false;
  document.getElementById('elevation_max').display = false;
  document.getElementById('elevation_min').disabled = false;

  window.truthAnnotationMode = 0;	// 0: None, 1: Delete, 2: Add
  let annotationScreen = $(
    `<div id="annotationScreen"><p id="annotation-label">ANNOTATION MODE: <b id="annotation-mode-text"></b></p></div>`);
  $('body').prepend(annotationScreen);
  let div = document.getElementById('annotationScreen');
  div.style.opacity = 0;

  window.addEventListener('keydown', (e) => {
    if (window.annotateLanesModeActive) {
      if (e.code == 'KeyA') {
        window.truthAnnotationMode = 2;
      } else if (e.code == 'KeyS') {
        window.truthAnnotationMode = 1;
      } else if (e.shiftKey) {
        window.truthAnnotationMode = (window.truthAnnotationMode + 1) % 3;
      }

      let div = document.getElementById('annotationScreen');
      let label = document.getElementById('annotation-mode-text');
      if (window.truthAnnotationMode == 0) {
        div.style.background = 'black';
        div.style.opacity = 0;
        label.innerHTML = 'NONE';
      } else if (window.truthAnnotationMode == 1) {
        div.style.background = 'red';
        div.style.opacity = 0.25;
        label.innerHTML = 'DELETE POINTS';
      } else if (window.truthAnnotationMode == 2) {
        div.style.background = 'green';
        div.style.opacity = 0.25;
        label.innerHTML = 'ADD POINTS';
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (window.annotateLanesModeActive) {
      window.truthAnnotationMode = 0;
      let div = document.getElementById('annotationScreen');
      let label = document.getElementById('annotation-mode-text');
      div.style.background = 'black';
      div.style.opacity = 0;
      label.innerHTML = 'NONE';
    }
  });

  // Load Data Sources in loadRtkCallback:
  loadRtkCallback(s3, bucket, name, () => {

    // Load Extrinsics:
    window.extrinsics = { rtk2Vehicle: null, velo2Rtk: {} };
    try {
      loadVelo2Rtk(s3, bucket, name, (velo2Rtk) => {

        if (!velo2Rtk) {
          disablePanels('Unable to load extrinsics file');
          return;
        }

        console.log('Velo2Rtk Extrinsics Loaded!');
        window.extrinsics.velo2Rtk = { old: velo2Rtk, new: velo2Rtk };
        storeVelo2Rtk(window.extrinsics.velo2Rtk.new);
        for (const cloud of viewer.scene.pointclouds) {

          let velo2RtkOld = window.extrinsics.velo2Rtk.old;
          let velo2RtkNew = window.extrinsics.velo2Rtk.new;

          cloud.material.uniforms.velo2RtkXYZOld.value.set(velo2RtkOld.x, velo2RtkOld.y,
            velo2RtkOld.z);
          cloud.material.uniforms.velo2RtkRPYOld.value.set(velo2RtkOld.roll, velo2RtkOld.pitch,
            velo2RtkOld.yaw);
          cloud.material.uniforms.velo2RtkXYZNew.value.set(velo2RtkNew.x, velo2RtkNew.y,
            velo2RtkNew.z);
          cloud.material.uniforms.velo2RtkRPYNew.value.set(velo2RtkNew.roll, velo2RtkNew.pitch,
            velo2RtkNew.yaw);
        }
      });

      loadRtk2Vehicle(s3, bucket, name, (rtk2Vehicle) => {
        console.log('Rtk2Vehicle Extrinsics Loaded!');
        window.extrinsics.rtk2Vehicle = { old: rtk2Vehicle, new: rtk2Vehicle };
        storeRtk2Vehicle(window.extrinsics.rtk2Vehicle.new);
      });
    } catch (e) {
      console.error('Could not load Calibrations: ', e);
    }

    // Load Lanes:
    try {
      loadLanesCallback(s3, bucket, name);
    } catch (e) {
      console.error('Could not load Lanes: ', e);
    }

    // Load Tracks:
    try {
      // TODO shaderMaterial
      let trackShaderMaterial = shaderMaterial.clone();
      loadTracksCallback(s3, bucket, name, trackShaderMaterial, animationEngine);
    } catch (e) {
      console.error('Could not load Tracks: ', e);
    }

    try {
      loadRemCallback(s3, bucket, name, animationEngine);
    } catch (e) {
      console.error('No rem points: ', e);
    }

    // Load Radar:
    try {
      // await loadRadarCallback(s3, bucket, name);
    } catch (e) {
      console.error('Could not load Radar Detections: ', e);
    }

    // Load Detections:
    // TODO

    // Load Gaps:
    // TODO

    // Configure AnimationEngine:
    // let tstart = window.timeframe.tstart;	// Set in loadRtkCallback
    // let tend = window.timeframe.tend;			// Set in loadRtkCallback
    // let playbackRate = 1.0;
    // animationEngine.configure(tstart, tend, playbackRate);
    // animationEngine.launch();
  }); // END loadRtkCallback()

}); // END $(document).ready()

// Load RTK: TODO REFACTOR THIS (a lot of stuff happenning here, break it up if possible)
function loadRtkCallback (s3, bucket, name, callback) {
  // loadRtk(s3, bucket, name, (pos, rot, timestamps, t_init, t_range) => {
  loadRtkFlatbuffer(s3, bucket, name, (pos, rot, timestamps, t_init, t_range) => {
    window.timeframe = { 'tstart': t_init, 'tend': t_init + t_range };

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
    // NOTE for Volt: {texture: models/Chevy_Volt_Segmented/Chevrolet_Volt_v1_exterior.png, mesh:
    // resources/models/Chevy_Volt_Segmented/Chevy_Volt_2016.obj}
    let manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
      console.log(item, loaded, total);
    };
    let textureLoader = new THREE.TextureLoader(manager);
    let texture = textureLoader.load(
      `${Potree.resourcePath}/models/Chevy_Volt_Segmented/reflection_1.png`);
    // let texture = textureLoader.load(`${Potree.resourcePath}/models/bodybkgd.JPG`);
    let onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        let percentComplete = xhr.loaded / xhr.total * 100;
      }
    };
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    let geometry = new THREE.SphereGeometry(2, 32, 32);
    let material = new THREE.MeshNormalMaterial(
      { side: THREE.DoubleSide, opacity: 0.92, transparent: true });
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(new THREE.Vector3(...pos[0]));
    // viewer.scene.scene.add( sphere );

    { // Load Textured vehicle from obj
      let onError = function (xhr) {};
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
          vehicleGroup.name = 'Vehicle';

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
            line.name = 'RTK Trajectory';
            line.visible = false;
            viewer.scene.scene.add(line);
            viewer.scene.dispatchEvent({ 'type': 'vehicle_layer_added', 'vehicleLayer': line });
          }

          // Add Polar Grid Helper:
          const gridRadius = 100; // meters
          const gridSpacing = 5; // meters
          const scaleFactor = 1; // HACK for now because attached to vehicle mesh which is 1/100th
                                 // scale
          const gridHelper = new THREE.GridHelper(scaleFactor * 2 * gridRadius,
            2 * gridRadius / gridSpacing, 0x0000ff, 0x808080);
          gridHelper.name = 'Cartesian Grid';
          gridHelper.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
          gridHelper.position.z -= 2;
          gridHelper.visible = false;
          viewer.scene.dispatchEvent({ 'type': 'vehicle_layer_added', 'vehicleLayer': gridHelper });
          const polarGridHelper = new THREE.PolarGridHelper(scaleFactor * gridRadius, 16,
            gridRadius / gridSpacing, 64, 0x0000ff, 0x808080);
          polarGridHelper.name = 'Polar Grid';
          polarGridHelper.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
          polarGridHelper.position.z -= 2;
          polarGridHelper.visible = false;
          viewer.scene.dispatchEvent(
            { 'type': 'vehicle_layer_added', 'vehicleLayer': polarGridHelper });
          const axesHelper = new THREE.AxesHelper(scaleFactor * gridSpacing);
          axesHelper.name = '3D Axes';
          axesHelper.position.z -= 2;
          // axesHelper.rotateOnAxis(new THREE.Vector3(0,0,1), -Math.PI/2);
          axesHelper.visible = false;
          viewer.scene.dispatchEvent({ 'type': 'vehicle_layer_added', 'vehicleLayer': axesHelper });

          vehicleGroup.add(gridHelper);
          vehicleGroup.add(polarGridHelper);
          vehicleGroup.add(axesHelper);

          // Apply RTK to Vehicle Mesh Extrinsics:
          object.name = 'Vehicle Mesh';
          object.scale.multiplyScalar(0.01);
          object.rotation.set(0 * Math.PI / 2, 0 * Math.PI / 2.0, 1 * Math.PI / 2.0); // Chevy Volt
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
          viewer.scene.dispatchEvent({ 'type': 'vehicle_layer_added', 'vehicleLayer': object });

          viewer.setFilterGPSTimeRange(0, 0); // Size 0 Time Window at start of timeline
          removeLoadingScreen();
        }, onProgress, onError);
    }

    // ANIMATION:
    { // create Animation Path & make light follow it
      { // ANIMATION + SLIDER LOGIC:
        let slider = document.getElementById('myRange');
        let time_display = document.getElementById('time_display');
        let tmin = document.getElementById('playbar_tmin');
        let tmax = document.getElementById('playbar_tmax');
        let zmin = document.getElementById('elevation_min');
        let zmax = document.getElementById('elevation_max');
        time_display.value = Math.round(10000 * slider.value) / 10000;

        // Playbar Button Functions:
        let playbutton = document.getElementById('playbutton');
        let pausebutton = document.getElementById('pausebutton');
        pausebutton.addEventListener('mousedown', () => {
          animationEngine.stop();
        });
        playbutton.addEventListener('mousedown', () => {
          animationEngine.start();
        });

        time_display.addEventListener('keyup', function onEvent (e) {
          if (e.keyCode === 13) {
            console.log('Enter');
            animationEngine.stop();
            let val = parseFloat(time_display.value);
            val = Math.max(0, val);
            val = Math.min(animationEngine.timeRange - 0.001, val);
            animationEngine.timeline.t = val + animationEngine.tstart;
            animationEngine.updateTimeForAll();
          }
        });

        slider.addEventListener('input', () => {
          animationEngine.stop();
          var val = slider.value / 100.0;
          animationEngine.timeline.t = val * animationEngine.timeRange + animationEngine.tstart;
          animationEngine.updateTimeForAll();
        });

        slider.addEventListener('wheel', () => {
          animationEngine.stop();
          var val = slider.value / 100.0;
          animationEngine.timeline.t = val * animationEngine.timeRange + animationEngine.tstart;
          animationEngine.updateTimeForAll();
        });

        zmin.addEventListener('input', () => {
          window.elevationWindow.min = Math.abs(Number(zmin.value));
          window.elevationWindow.max = Math.abs(Number(zmax.value));
          animationEngine.updateTimeForAll();
        });

        zmax.addEventListener('input', () => {
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
      let vehicle = viewer.scene.scene.getObjectByName('Vehicle');
      let mesh = vehicle.getObjectByName('Vehicle Mesh');
      let lastRtkPoint = vehicle.position.clone();
      let lastRtkOrientation = vehicle.rotation.clone();
      let lastTransform = vehicle.matrixWorld.clone();
      // debugger; //vehicle
      let state = vehicle.rtkTrajectory.getState(gpsTime);
      let rtkPoint = state.pose.clone();
      let vehicleOrientation = state.orient.clone();
      vehicle.position.copy(rtkPoint);
      if (visualizationMode == 'aptivLanes') {
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
        viewer.scene.pointclouds[ii].material.elevationRange =
          [window.elevationWindow.z - window.elevationWindow.min,
            window.elevationWindow.z + window.elevationWindow.max];
        // TODO set elevation slider range extent
      }

      // Save Current RTK Pose in Uniforms:
      for (let ii = 0, numClouds = clouds.length; ii < numClouds; ii++) {
        let material = clouds[ii].material;
        material.uniforms.currentRtkPosition.value = state.pose.clone();
        material.uniforms.currentRtkOrientation.value = state.orient.toVector3().clone();
      }
    } catch (e) {
      console.error('Caught error: ', e);
    }
  });
}

// Animation Start/Stop Callbacks:
// TODO Put these somewhere better
{
  let playbutton = document.getElementById('playbutton');
  let pausebutton = document.getElementById('pausebutton');

  animationEngine.preStartCallback = function () {
    if (!animationEngine.isPlaying) {
      $('#playbutton').trigger('mousedown');
    }
  };

  animationEngine.preStopCallback = function () {
    if (animationEngine.isPlaying) {
      $('#pausebutton').trigger('mousedown');
    }
  };

}

// List of all Tween Target Update Functions:
// TODO Organize these (move them to the right place)
{
  // PointCloud:
  animationEngine.tweenTargets.push((gpsTime) => {
    // debugger; // account for pointcloud offset
    let minGpsTime = gpsTime - animationEngine.activeWindow.backward;
    let maxGpsTime = gpsTime + animationEngine.activeWindow.forward;
    viewer.setFilterGPSTimeRange(minGpsTime, maxGpsTime);
    viewer.setFilterGPSTimeExtent(minGpsTime - 1.5 * animationEngine.activeWindow.backward,
      maxGpsTime + 1.5 * animationEngine.activeWindow.forward);
  });

  // Playbar:
  animationEngine.tweenTargets.push((gpsTime) => {
    let slider = document.getElementById('myRange');
    let time_display = document.getElementById('time_display');
    let tmin = document.getElementById('playbar_tmin');
    let tmax = document.getElementById('playbar_tmax');
    let toggleplay = document.getElementById('toggleplay');
    // TODO add playbackSpeed
    time_display.value = Math.round(10000 * slider.value) / 10000;

    let t = (gpsTime - animationEngine.tstart) / (animationEngine.timeRange);
    slider.value = 100 * t;
    time_display.value = Math.round(10000 * (gpsTime - animationEngine.tstart)) / 10000; // Centered
                                                                                         // to zero
  });

  // // Camera:
  // let updateCamera = false;
  // let lag = 1.01; // seconds
  // let camPointZOffset = 10; // meters
  // window.camControlInitialized = false;
  // window.camPointNeedsToBeComputed = true;
  // window.camControlInUse = false;
  // window.camDeltaTransform = {camStart: new THREE.Matrix4(), vehicleStart: new THREE.Vector3(),
  // camEnd: new THREE.Matrix4(), vehicleEnd: new THREE.Vector3()}; window.camPointLocalFrame =
  // {position: new THREE.Vector3(-10,0,10)}; window.camTargetLocalFrame = {position: new
  // THREE.Vector3(0, 0, 0)};

  viewer.renderArea.addEventListener('keypress', (e) => {
    if (e.key == 'r') {
      let box = new THREE.Box3().setFromObject(
        viewer.scene.scene.getObjectByName('Vehicle').getObjectByName('Vehicle Mesh'));
      let node = new THREE.Object3D();
      node.boundingBox = box;
      viewer.zoomTo(node, 5, 500);
    }
  });
}

// Reload Lanes Button Code (Start)
window.annotateLanesModeActive = false;
$(document).ready(() => {
  // Configure Playbar
  $('#reload_lanes_button')[0].style.display = 'block';
  let reloadLanesButton = $('#reload_lanes_button')[0];
  reloadLanesButton.addEventListener('mousedown', () => {

    let proceed = true;
    if (window.annotateLanesModeActive) {
      proceed =
        confirm(
          'Proceed? Lanes will be reloaded, so ensure that annotations have been saved if you want to keep them.');
    }

    if (proceed) {
      // REMOVE LANES
      let removeLanes = viewer.scene.scene.getChildByName('Lanes');
      while (removeLanes) {
        viewer.scene.scene.remove(removeLanes);
        removeLanes = viewer.scene.scene.getChildByName('Lanes');
      }

      // Pause animation:
      animationEngine.stop();

      // TOGGLE window.annotateLanesModeActive
      window.annotateLanesModeActive = !window.annotateLanesModeActive;

      // Disable Button:
      reloadLanesButton.disabled = true;

      {
        $('#loading-bar')[0].style.display = 'none';
        setLoadingScreen();
        loadLanesCallback(s3, bucket, name, () => {
          removeLoadingScreen();

          // TOGGLE BUTTON TEXT
          if (window.annotateLanesModeActive) {
            reload_lanes_button.innerText = 'View Truth Lanes';
            document.getElementById('download_lanes_button').style.display = 'block';
          } else {
            reload_lanes_button.innerText = 'Annotate Truth Lanes';
            document.getElementById('download_lanes_button').style.display = 'none';
          }

          reloadLanesButton.disabled = false;

        });
      }
    }
  });
});
// Reload Lanes Button Code (end)

// Load Lanes Code (start)
// Load Lanes Truth Data:
async function loadLanesCallback (s3, bucket, name, callback) {

  let filename, tmpSupplierNum;
  tmpSupplierNum = -1;
  await loadLanes(s3, bucket, name, filename, tmpSupplierNum, window.annotateLanesModeActive,
    viewer.scene.volumes, (laneGeometries) => {

      // need to have Annoted Lanes layer, so that can have original and edited lanes layers
      let lanesLayer = new THREE.Group();
      lanesLayer.name = 'Lanes';
      for (let ii = 0, len = laneGeometries.all.length; ii < len; ii++) {
        lanesLayer.add(laneGeometries.all[ii]);
      }
      viewer.scene.scene.add(lanesLayer);
      viewer.scene.dispatchEvent({
        'type': 'truth_layer_added', 'truthLayer': lanesLayer
      });
      if (callback) {
        callback();
      }
    });

  if (visualizationMode == 'aptivLanes') {

    async function loadLanesHelper (layerName, filename, s) {
      try {
        await loadLanes(s3, bucket, name, filename, s, window.annotateLanesModeActive,
          viewer.scene.volumes, (laneGeometries) => {
            let lanesLayer = new THREE.Group();
            lanesLayer.name = layerName;
            for (let ii = 0, len = laneGeometries.all.length; ii < len; ii++) {
              lanesLayer.add(laneGeometries.all[ii]);
            }
            viewer.scene.scene.add(lanesLayer);
            viewer.scene.dispatchEvent({
              'type': 'map_provider_layer_added', 'mapLayer': lanesLayer
            });
          });
      } catch (e) {
        console.log(`Couldn't load ${filename}: ${e}`);
      }
    }

    const laneNum = [1, 2, 3];
    const laneDirection = ['EB', 'WB'];
    const supplierNum = [1, 2, 3];
    let filename, layerName, datasetName;

    for (let s of supplierNum) {
      for (let d of laneDirection) {
        for (let n of laneNum) {
          layerName = `Supplier${s}_${d}_Lane${n}`;
          filename = `Supplier${s}_${d}_Lane${n}.fb`;

          loadLanesHelper(layerName, filename, s);
        }
      }
    }

    layerName = `TomTom`;
    filename = `I-75-North_potree.fb`;
    loadLanesHelper(layerName, filename, 1);
  }

  // Load Comparison Dataset (hardcoded to one for now)
  if (comparisonDatasets.length > 0) {
    filename = 'lanes.fb';
    tmpSupplierNum = -2;
    await loadLanes(s3, bucket, comparisonDatasets[0], filename, tmpSupplierNum,
      window.annotateLanesModeActive, viewer.scene.volumes, (laneGeometries) => {

        let lanesLayer = new THREE.Group();
        lanesLayer.name = `Lanes-${comparisonDatasets[0].split('Data/')[1]}`;
        for (let ii = 0, len = laneGeometries.all.length; ii < len; ii++) {
          lanesLayer.add(laneGeometries.all[ii]);
        }
        viewer.scene.scene.add(lanesLayer);
        viewer.scene.dispatchEvent({
          'type': 'truth_layer_added', 'truthLayer': lanesLayer
        });
      });
  }

}

// Load Lanes Code (end)

// Load Gaps Code (Start)
window.gapsLoaded = false;
$(document).ready(() => {
  // Configure Playbar
  $('#load_gaps_button')[0].style.display = 'block';
  let loadGapsButton = $('#load_gaps_button')[0];
  loadGapsButton.addEventListener('mousedown', () => {

    if (!window.gapsLoaded) {
      $('#loading-bar')[0].style.display = 'none';
      setLoadingScreen();

      let gapShaderMaterial = shaderMaterial.clone();
      gapShaderMaterial.uniforms.color.value = new THREE.Color(0x0000ff);
      gapShaderMaterial.depthWrite = false;
      loadGaps(s3, bucket, name, gapShaderMaterial, animationEngine, (gapGeometries) => {
        let gapsLayer = new THREE.Group();
        gapsLayer.name = 'Vehicle Gaps';
        for (let ii = 0, len = gapGeometries.left.length; ii < len; ii++) {
          // if (ii < 1000) {
          gapsLayer.add(gapGeometries.left[ii]);
          // }
        }
        viewer.scene.scene.add(gapsLayer);
        viewer.scene.dispatchEvent({
          'type': 'assessments_layer_added', 'assessmentsLayer': gapsLayer
        });
        animationEngine.tweenTargets.push((gpsTime) => {
          let currentTime = gpsTime - animationEngine.tstart;
          gapShaderMaterial.uniforms.minGpsTime.value =
            currentTime - animationEngine.activeWindow.backward;
          gapShaderMaterial.uniforms.maxGpsTime.value =
            currentTime + animationEngine.activeWindow.forward;
        });
        window.gapsLoaded = true;
        loadGapsButton.disabled = true;
        removeLoadingScreen();
      });
    }
  });
});
// Load Gaps Code (end)

//load REM control points
// TODO Move this somewhere else

async function loadRemCallback (s3, bucket, name, animationEngine) {
  let remShaderMaterial = shaderMaterial.clone();

  await loadRem(s3, bucket, name, remShaderMaterial, animationEngine, (sphereMeshes) => {
    let remLayer = new THREE.Group();
    remLayer.name = 'REM Control Points';
    for (let ii = 0, len = sphereMeshes.length; ii < len; ii++) {
      remLayer.add(sphereMeshes[ii]);
    }

    viewer.scene.scene.add(remLayer);
    let e = new CustomEvent('truth_layer_added', { detail: remLayer, writable: true });
    viewer.scene.dispatchEvent({
      'type': 'sensor_layer_added', 'sensorLayer': remLayer
    });

    // TODO check if group works as expected, then trigger "truth_layer_added" event
    animationEngine.tweenTargets.push((gpsTime) => {
      let currentTime = gpsTime - animationEngine.tstart;
      remShaderMaterial.uniforms.minGpsTime.value =
        currentTime - animationEngine.activeWindow.backward;
      remShaderMaterial.uniforms.maxGpsTime.value =
        currentTime + animationEngine.activeWindow.forward;
    });
  });
}

// Load Tracks Code (Start)
// TODO Move this somewhere else
let trackShaderMaterial = shaderMaterial.clone();

async function loadTracksCallback (s3, bucket, name, trackShaderMaterial, animationEngine) {

  await loadTracks(s3, bucket, name, trackShaderMaterial, animationEngine, (trackGeometries) => {
    let trackLayer = new THREE.Group();
    trackLayer.name = 'Tracked Objects';
    for (let ii = 0, len = trackGeometries.bbox.length; ii < len; ii++) {
      trackLayer.add(trackGeometries.bbox[ii]);
      // viewer.scene.scene.add(trackGeometries.bbox[ii]); // Original
    }

    viewer.scene.scene.add(trackLayer);
    let e = new CustomEvent('truth_layer_added', { detail: trackLayer, writable: true });
    viewer.scene.dispatchEvent({
      'type': 'truth_layer_added', 'truthLayer': trackLayer
    });

    // TODO check if group works as expected, then trigger "truth_layer_added" event
    animationEngine.tweenTargets.push((gpsTime) => {
      let currentTime = gpsTime - animationEngine.tstart;
      trackShaderMaterial.uniforms.minGpsTime.value =
        currentTime - animationEngine.activeWindow.backward;
      trackShaderMaterial.uniforms.maxGpsTime.value =
        currentTime + animationEngine.activeWindow.forward;
    });
  });
}

window.detectionsLoaded = false;
$(document).ready(() => {
  // Configure Playbar
  $('#load_detections_button')[0].style.display = 'block';
  let loadDetectionsButton = $('#load_detections_button')[0];
  loadDetectionsButton.addEventListener('mousedown', () => {
    if (!window.detectionsLoaded) {
      $('#loading-bar')[0].style.display = 'none';
      setLoadingScreen();
      let detectionShaderMaterial = shaderMaterial.clone();
      detectionShaderMaterial.uniforms.color.value = new THREE.Color(0xFFA500);
      loadDetections(s3, bucket, name, detectionShaderMaterial, animationEngine,
        (detectionGeometries) => {
          let detectionLayer = new THREE.Group();
          detectionLayer.name = 'Object Detections';
          for (let ii = 0, len = detectionGeometries.bbox.length; ii < len; ii++) {
            detectionLayer.add(detectionGeometries.bbox[ii]);
          }
          viewer.scene.scene.add(detectionLayer);
          viewer.scene.dispatchEvent({
            'type': 'truth_layer_added', 'truthLayer': detectionLayer
          });
          animationEngine.tweenTargets.push((gpsTime) => {
            let currentTime = gpsTime - animationEngine.tstart;
            detectionShaderMaterial.uniforms.minGpsTime.value =
              currentTime - animationEngine.activeWindow.backward;
            detectionShaderMaterial.uniforms.maxGpsTime.value =
              currentTime + animationEngine.activeWindow.forward;
          });
          window.detectionsLoaded = true;
          loadDetectionsButton.disabled = true;
          removeLoadingScreen();
        });
    }
  });
});

// Load Tracks Code (End)

// // Load Radar Cubes:
// loadRadar((geometry, t_init) => {
//
//   // uniforms
//   uniforms = {
//       color: { value: new THREE.Color( 0xffff00 ) },
//       minGpsTime: {value: 0.0 },
//       maxGpsTime: {value: 110.0 },
//       initialTime: {value: t_init}
//   };
//
//   // point cloud material
//   var shaderMaterial = new THREE.ShaderMaterial( {
//
//       uniforms:       uniforms,
//       vertexShader:   document.getElementById( 'vertexshader' ).textContent,
//       fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
//       transparent:    true
//
//   });
//
//   var material = new THREE.PointsMaterial( {size:1.0} );
//   var mesh = new THREE.Points(geometry, shaderMaterial);
//   mesh.name = "radar";
//   // debugger; //radar tracks added?
//   viewer.scene.scene.add(mesh);
// });

// Load Radar Code (Start)
window.radarLoaded = false;
$(document).ready(() => {
  // Configure Playbar
  $('#load_radar_button')[0].style.display = 'block';
  let loadRadarButton = $('#load_radar_button')[0];
  loadRadarButton.addEventListener('mousedown', () => {
    if (!window.radarLoaded) {
      $('#loading-bar')[0].style.display = 'none';
      setLoadingScreen();

      loadRadar(s3, bucket, name, (geometry, t_init, boxBufferGeometries) => {

        let boxMesh = new THREE.Mesh(boxBufferGeometries,
          new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        boxMesh.name = 'radar_boxes';
        // viewer.scene.scene.add(boxMesh);

        // uniforms
        let uniforms = {
          color: { value: new THREE.Color(0xffff00) },
          minGpsTime: { value: 0.0 },
          maxGpsTime: { value: 110.0 },
          initialTime: { value: t_init }
        };

        // point cloud material
        var shaderMaterial = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: document.getElementById('vertexshader').textContent,
          fragmentShader: document.getElementById('fragmentshader').textContent,
          transparent: true

        });

        var material = new THREE.PointsMaterial({ size: 1.0 });
        var mesh = new THREE.Points(geometry, shaderMaterial);
        mesh.name = 'radar';
        // debugger; //radar tracks added?
        viewer.scene.scene.add(mesh);
        viewer.scene.dispatchEvent({ 'type': 'sensor_layer_added', 'sensorLayer': mesh });

        // Create tween:
        {
          animationEngine.tweenTargets.push((t) => {
            // debugger;
            let minGpsTime = t - animationEngine.activeWindow.backward;
            let maxGpsTime = t + animationEngine.activeWindow.forward;
            let radarOffset = t_init;
            let minRadarTime = minGpsTime - radarOffset;
            let maxRadarTime = maxGpsTime - radarOffset;
            let radar = viewer.scene.scene.getObjectByName('radar');
            radar.material.uniforms.minGpsTime.value = minRadarTime;
            radar.material.uniforms.maxGpsTime.value = maxRadarTime;
          });
        }
        window.radarLoaded = true;
        loadRadarButton.disabled = true;
        removeLoadingScreen();
      });
    }
  });
});

// Listener to store pointcloud material as calibration extrinsics get updated
window.addEventListener('update-calibration-panel', (e) => {
  console.log('calibration panel updated: ', e.detail);
  const id = e.detail.id;
  const dim = e.detail.dim;
  const val = e.detail.value;

  for (const cloud of viewer.scene.pointclouds) {
    let material = cloud.material;

    if (id == 'rtk2vehicle') {
      let rtk2Vehicle = getRtk2Vehicle();
      let vehicleMesh = viewer.scene.scene.getObjectByName('Vehicle')
        .getObjectByName('Vehicle Mesh');

      // Apply Transformations to Vehicle:
      let translation = new THREE.Vector3(rtk2Vehicle.x, rtk2Vehicle.y, rtk2Vehicle.z);
      vehicleMesh.position.copy(translation);
      vehicleMesh.rotation.set(rtk2Vehicle.roll, rtk2Vehicle.pitch, rtk2Vehicle.yaw);

      // Store updated values in mesh:
      material.uniforms.rtk2VehicleXYZNew =
        { type: 'v3', value: new THREE.Vector3(rtk2Vehicle.x, rtk2Vehicle.y, rtk2Vehicle.z) };
      material.uniforms.rtk2VehicleRPYNew =
        {
          type: 'v3',
          value: new THREE.Vector3(rtk2Vehicle.roll, rtk2Vehicle.pitch, rtk2Vehicle.yaw)
        };

    } else if (id == 'velo2rtk') {

      let velo2Rtk = getVelo2Rtk();
      material.uniforms.velo2RtkXYZNew =
        { type: 'v3', value: new THREE.Vector3(velo2Rtk.x, velo2Rtk.y, velo2Rtk.z) };
      material.uniforms.velo2RtkRPYNew =
        { type: 'v3', value: new THREE.Vector3(velo2Rtk.roll, velo2Rtk.pitch, velo2Rtk.yaw) };

    } else {
      console.error('Unknown Calibration Extrinsics Id:', id);
    }
  }
});

window.canEnableCalibrationPanels = true;

function canUseCalibrationPanels (attributes) {
  let hasRtkPose = false;
  let hasRtkOrient = false;
  for (let attr of attributes) {
    hasRtkPose = hasRtkPose || (attr.name === PointAttributeNames.RTK_POSE);
    hasRtkOrient = hasRtkOrient || (attr.name === PointAttributeNames.RTK_ORIENT);
  }
  return hasRtkPose && hasRtkOrient;
}

// Load Pointclouds
if (runForLocalDevelopment) {
  Potree.loadPointCloud('../pointclouds/test/cloud.js', 'full-cloud', e => {
    const pointcloud = e.pointcloud;
    const material = pointcloud.material;
    viewer.scene.addPointCloud(pointcloud);
    material.pointColorType = Potree.PointColorType.INTENSITY; // any Potree.PointColorType.XXXX
    material.gradient = Potree.Gradients.GRAYSCALE; // Can define custom gradient or look up in
                                                    // Potree.Gradients
    material.size = 0.09;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    material.shape = Potree.PointShape.SQUARE;

    let cloudCanUseCalibrationPanels = canUseCalibrationPanels(
      pointcloud.pcoGeometry.pointAttributes.attributes);
    window.canEnableCalibrationPanels =
      window.canEnableCalibrationPanels && cloudCanUseCalibrationPanels;

    if (window.canEnableCalibrationPanels) {
      $(document).ready(() => enablePanels());

    } else {
      $(document).ready(() => {
        let reason = 'Pointcloud was not serialized with the necessary point attributes';
        disablePanels(reason);
        console.error('Cannot use calibration panels: ', reason);
      });
    }
  });

} else {
  Potree.loadPointCloud({ s3, bucket, name }, name.substring(5), e => {
    const pointcloud = e.pointcloud;
    const material = pointcloud.material;
    viewer.scene.addPointCloud(pointcloud);
    material.pointColorType = Potree.PointColorType.INTENSITY; // any Potree.PointColorType.XXXX
    material.gradient = Potree.Gradients.GRAYSCALE;
    material.size = 0.09;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    material.shape = Potree.PointShape.SQUARE;

    let cloudCanUseCalibrationPanels = canUseCalibrationPanels(
      pointcloud.pcoGeometry.pointAttributes.attributes);
    window.canEnableCalibrationPanels =
      window.canEnableCalibrationPanels && cloudCanUseCalibrationPanels;

    if (window.canEnableCalibrationPanels) {
      $(document).ready(() => enablePanels());

    } else {
      $(document).ready(() => {
        disablePanels("Pointcloud was not serialized with the necessary point attributes");
        console.error("Cannot use calibration panels");
      });
    }

    $("#playbutton").click();

    try {
      togglePointClass(pointcloud);
    } catch (e) {
      console.log("Pointcloud loaded before sidebar initialized: ", e);
    }
  });
}
