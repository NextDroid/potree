// this file is intended to call every other function in order to get potree to load

import { runForLocalDevelopment, params, bucket, region, names, name, visualizationMode,
	annotateLanesAvailable, downloadLanesAvailable, calibrationModeAvailable, accessKeyId,
	secretAccessKey, sessionToken, fonts, theme, comparisonDatasets, s3} from "../demo/paramLoader.js"
import { createViewer } from "../demo/viewer.js" 

// Call all function to load potree
export function loadPotree() {
	createViewer();
}