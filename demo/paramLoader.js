// This file loads all constant params into global space
const runForLocalDevelopment = location.search === "" && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const params = new URLSearchParams(location.search);
const bucket = params.get("bucket");
const region = params.get("region");
const names = JSON.parse(params.get("names"));
const name = params.get("clicked");
const visualizationMode = params.get("mode");
const annotateLanesAvailable = params.get('annotate') == 'Annotate';
const downloadLanesAvailable = annotateLanesAvailable;
const calibrationModeAvailable = params.get("calibrate") == "Calibrate" || runForLocalDevelopment;
const accessKeyId = params.get("key1");
const secretAccessKey = params.get("key2");
const sessionToken = params.get("key3");
const fonts = JSON.parse(params.get("fonts"));
const theme = JSON.parse(params.get("theme")); // material-ui theme
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
	style.innerHTML = `#value {font-family: ${typography.fontFamily} !important;} #sidebar_root {font-family: 
		${typography.fontFamily} !important;} #potree_languages {font-family: ${typography.fontFamily} !important;}`;
	head.appendChild(style);
}

const s3 = bucket && region && name && accessKeyId && secretAccessKey &&
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