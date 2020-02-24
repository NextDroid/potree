// This file contains common params generated from the url
export const runForLocalDevelopment = location.search === "" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const params = new URLSearchParams(location.search);
export const bucket = params.get("bucket");
export const region = params.get("region");
export const names = JSON.parse(params.get("names"));
export const name = params.get("clicked");
export const visualizationMode = params.get("mode");
export const annotateLanesAvailable = params.get('annotate') == 'Annotate';
export const downloadLanesAvailable = annotateLanesAvailable;
export const calibrationModeAvailable = params.get("calibrate") == "Calibrate" || runForLocalDevelopment;
export const accessKeyId = params.get("key1");
export const secretAccessKey = params.get("key2");
export const sessionToken = params.get("key3");
export const fonts = JSON.parse(params.get("fonts"));
export const theme = JSON.parse(params.get("theme")); // material-ui theme
export let comparisonDatasets = [];
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
	style.innerHTML = `#value {font-family: ${typography.fontFamily} !important;} #sidebar_root {font-family: 
		${typography.fontFamily} !important;} #potree_languages {font-family: ${typography.fontFamily} !important;}`;
	head.appendChild(style);
}

export const s3 = bucket && region && name && accessKeyId && secretAccessKey &&
			new AWS.S3({region: region,
							accessKeyId: accessKeyId,
							secretAccessKey: secretAccessKey,
							sessionToken: sessionToken,
						});

if (!(s3 || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) { 
	window.history.back() 
};
// We really want this, but it doesn't work in the browser. Only on a server.
// const stream = s3.getObject({Bucket: bucket,
//                              Key: name}).createReadStream();