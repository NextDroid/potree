
function isNan(n) {
  return n !== n;
}

export async function loadRadar(s3, bucket, name, callback) {
  const tstart = performance.now();
  if (s3 && bucket && name) {
    const objectName = `${name}/0_Preprocessed/radardata.csv`;
    s3.getObject({Bucket: bucket,
                  Key: objectName},
                 (err, data) => {
                   if (err) {
                     console.log(err, err.stack);
                   } else {
                     const string = new TextDecoder().decode(data.Body);
                     const {geometry, t_init} = parseRadar(string);
                     callback(geometry, t_init);
                   }});
  } else {
    const filename = "csv/radar_tracks_demo.csv";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", filename);
    xhr.onload = function(data) {
      const {geometry, t_init} = parseRadar(data.target.response);
      console.log("Full Runtime: "+(performance.now()-tstart)+"ms");
      callback(geometry, t_init);
    };
    xhr.send();
  }
}
function parseRadar(radarString) {
	const t0_loop = performance.now();
    const rows = radarString.split('\n');

  	const tcol = 3;
  	const xcol = 27;
  	const ycol = 28;
  	const zcol = 29;

    var boxGeometries = new THREE.Geometry(); // TODO REMOVE
    var boxPositions = []; // TODO REMOVE

    var geometry = new THREE.BufferGeometry();
    let positions = [];
    let timestamps = [];
    let colors = [];
    let alphas = [];

    let row, cols;
    let t_init = 0;
    let firstTimestamp = true;
    for (let ii = 0, len = rows.length; ii < len-1; ++ii) {
      row = rows[ii];
      cols = row.split(',');

      if (cols.length > 0) {
        const t = parseFloat(cols[tcol]);
        const x = parseFloat(cols[xcol]);
        const y = parseFloat(cols[ycol]);
        const z = parseFloat(cols[zcol]);


        if (isNan(t) || isNan(x) || isNan(y) || isNan(z)) {
          // skip
          continue;
        }


        if (firstTimestamp) {
          t_init = t;
          firstTimestamp = false;
        }

        // timestamps.push(t);
        timestamps.push(t-t_init);
        positions.push(x);
        positions.push(y);
        positions.push(z);
        colors.push( Math.random() * 0xffffff );
        colors.push( Math.random() * 0xffffff );
        colors.push( Math.random() * 0xffffff );
        alphas.push( 1.0 );

        let boxSize = 0.15; // TODO REMOVE
        let boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize); // TODO REMOVE
        boxGeometry.translate(x, y, z); // TODO REMOVE
        boxGeometries.merge(boxGeometry); // TODO REMOVE
        boxPositions.push( new THREE.Vector3(x, y, z) );  // TODO REMOVE
      }
    }
    // debugger; // timestamp


    if ( positions.length > 0 ) geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    if (timestamps.length > 0) geometry.addAttribute('gpsTime', new THREE.Float32BufferAttribute(timestamps, 1));
    if (colors.length > 0) geometry.addAttribute('color', new THREE.Uint8BufferAttribute(colors, 3));
    if (alphas.length > 0) geometry.addAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));

    console.log("timestamps");
    console.log(timestamps);
    console.log(positions);
    console.log("Loop Runtime: "+(performance.now()-t0_loop)+"ms");

    // callback(geometry, t_init);
    let boxBufferGeometries = new THREE.BufferGeometry().fromGeometry(boxGeometries);
    return {geometry, t_init, boxBufferGeometries}; // TODO REMOVE
  };
