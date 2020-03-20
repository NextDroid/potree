// this file handles the creation of the potree viewer
import { visualizationMode, annotateLanesAvailable, downloadLanesAvailable, 
	calibrationModeAvailable} from "../demo/paramLoader.js"

export function createViewer() {
	window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));
	viewer.setEDLEnabled(true);
	viewer.setFOV(60);
	viewer.setPointBudget(1 * 1000 * 1000);
	document.title = "";
	viewer.setEDLEnabled(false);
	viewer.setBackground("gradient"); // ["skybox", "gradient", "black", "white"];
	viewer.setDescription(``);
	viewer.loadSettingsFromURL();

	viewer.loadGUI(() => {
		// Override Sidebar Potree Branding Panel:
		document.getElementById("potree_branding").style.display = "none";
		document.getElementById("menu_about").style.display = "none";

		viewer.setLanguage('en');
		$("#menu_appearance").next().show();
		$("#menu_tools").next().show();
		$("#menu_scene").next().show();
		// viewer.toggleSidebar();
		// viewer.setNavigationMode(EarthControls); // TODO Hack: changed default in viewer.js line 234
		// $('#show_bounding_box').trigger("click");
		// $("#splat_quality_options_hq").trigger("click"); // NOTE: HQ Splat breaks OrthographicCamera
		// viewer.scene.view.position.set(300198.109, 4701144.537, 349.871);
		// viewer.scene.view.lookAt(new THREE.Vector3(299900.954, 4701576.919, 66.197));
		updateSidebar(visualizationMode);

		window.calibrationModeAvailable = calibrationModeAvailable;
		document.getElementById("toggle_calibration_panels").style.display = window.calibrationModeAvailable ? "block" : "none";

		if (visualizationMode == "aptivLanes") {
			viewer.setCameraMode(Potree.CameraMode.ORTHOGRAPHIC);
			viewer.scene.view.maxPitch = -Math.PI / 2;

			document.getElementById("playback_speed").style.display = "none";
			document.getElementById("toggleslider").style.display = "none";
			document.getElementById("toggle_calibration_panels").style.display = "none";
			document.getElementById("load_detections_button").style.display = "none";
			document.getElementById("load_radar_button").style.display = "none";
			document.getElementById("load_gaps_button").style.display = "none";
			document.getElementById("camera_projection_options").children[0].children[1].children[0].style.display = "none"; // Hide projective camera option
		}

		// Disable download lanes
		if (!downloadLanesAvailable || !annotateLanesAvailable) {
			let downloadLanesButton = document.getElementById("download_lanes_button");
			downloadLanesButton.parentNode.removeChild(downloadLanesButton);

			if (!annotateLanesAvailable) {
				let reloadLanesButton = document.getElementById("reload_lanes_button");
				reloadLanesButton.parentNode.removeChild(reloadLanesButton);
			}
		}

		// Check if Classification Attribute is exists in PointCloud:
		try {
			let pointcloud = viewer.scene.pointclouds[0];
			togglePointClass(pointcloud);
		} catch (e) {
			console.log("Sidebar initialized pointcloud loaded: ", e);
		}
	});
}
