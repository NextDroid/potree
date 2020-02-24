// this file is intended to call every other function in order to get potree to load

import {} from "../demo/paramLoader.js"
import { createViewer } from "../demo/viewer.js" 

// Call all function to load potree
export function loadPotree() {
    createViewer();
    
    // Create AnimationEngine:
    window.animationEngine = new AnimationEngine();
}