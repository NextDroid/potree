// this file is intended to call every other function in order to get potree to load

import {} from "../demo/paramLoader.js"
import { createViewer } from "../demo/viewer.js" 
import { AnimationEngine } from "../demo/animationEngine.js"
import { createPlaybar } from "../common/playbar.js"

// Call all function to load potree
export function loadPotree() {
	// Create AnimationEngine:
	createViewer();
	window.animationEngine = new AnimationEngine();
	
	$(document).ready(() => {
		createPlaybar(); 

	});
}