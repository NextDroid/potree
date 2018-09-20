
function minAngle(theta) {
  if (theta < - Math.PI) {
    theta += 2*Math.PI;
  }
  if (theta > Math.PI) {
    theta -= 2*Math.PI;
  }
  return theta;
}

function loadRtk(callback) {

  let filename = "rtkdata.csv";
  let tcol = 1;       // GPS_TIME
  // let tcol = 3;       // SYSTEM_TIME
  let xcol = 12;      // RTK_EASTING_M
  let ycol = 13;      // RTK_NORTHING_M
  let zcol = 14;      // RTK_ALT_M
  let yawcol = 15;    // ADJUSTED_HEADING_RAD
  let pitchcol = 16;  // PITCH_RAD
  let rollcol = 17;   // ROLL_RAD

  let t0, t1;
  let tstart = performance.now();
  let distance = 0; // total distance of path

  const xhr = new XMLHttpRequest();
  xhr.open("GET", filename);

  xhr.onprogress = function(event) {
    t1 = performance.now();
    console.log("Loaded ["+event.loaded+"] bytes in ["+(t1-t0)+"] ms")
    t0 = t1;
  }

  xhr.onload = function(data) {
    var t0_loop = performance.now();
    var rows = data.target.response.split('\n');

    var geometry = new THREE.BufferGeometry();
    var mpos = [];
    var positions = [];
    var timestamps = [];
    var colors = [];
    var orientations = [];

    let row, cols;
    let t_init = 0;
    let t_range = 0;
    let firstTimestamp = true;
    let lastx, lasty, lastz;
    let lastRoll, lastPitch, lastYaw;

    for (let ii = 0, len = rows.length; ii < len-1; ++ii) {
      row = rows[ii];
      cols = row.split(' ');
      if (cols.length > 0) {
        t = parseFloat(cols[tcol]);
        x = parseFloat(cols[xcol]);
        y = parseFloat(cols[ycol]);
        z = parseFloat(cols[zcol]);
        roll = parseFloat(cols[rollcol]);
        pitch = parseFloat(cols[pitchcol]);
        yaw = parseFloat(cols[yawcol]);


        if (isNan(t) || isNan(x) || isNan(y) || isNan(z)) {
          // skip
          continue;
        }

        if (firstTimestamp) {
          t_init = t;
          firstTimestamp = false;
          lastx = x;
          lasty = y;
          lastz = z;
          lastRoll = 0;
          lastPitch = 0;
          lastYaw = 0;
        } else {
          lastOrientation = orientations[orientations.length - 1];
          lastRoll = lastOrientation[0];
          lastPitch = lastOrientation[1];
          lastYaw = lastOrientation[2];
        }

        // timestamps.push(t);
        t_range = t-t_init;
        timestamps.push(t-t_init);
        positions.push(x);
        positions.push(y);
        positions.push(z);
        colors.push( Math.random() * 0xffffff );
        colors.push( Math.random() * 0xffffff );
        colors.push( Math.random() * 0xffffff );
        mpos.push([x,y,z]);

        roll = lastRoll + minAngle(roll-lastRoll);
        pitch = lastPitch + minAngle(pitch-lastPitch);
        yaw = lastYaw + minAngle(yaw-lastYaw);

        orientations.push([roll, pitch, yaw]);

        distance += Math.sqrt( (x-lastx)*(x-lastx) + (y-lasty)*(y-lasty) + (z-lastz)*(z-lastz) );
        lastx = x;
        lasty = y;
        lastz = z;
      }
    }

    numPoints = timestamps.length;
    if ( positions.length > 0 ) geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    if (timestamps.length > 0) geometry.addAttribute('gpsTime', new THREE.Float32BufferAttribute(timestamps, 1));
    if (colors.length > 0) geometry.addAttribute('color', new THREE.Uint8BufferAttribute(colors, 3));
    var material = new THREE.PointsMaterial( {size:0.2} );
    var mesh = new THREE.Points(geometry, material);

    console.log(timestamps);
    console.log(positions);
    console.log("Loop Runtime: "+(performance.now()-t0_loop)+"ms");
    console.log("Full Runtime: "+(performance.now()-tstart)+"ms");


    callback(mpos, orientations, t_init, t_range, numPoints, distance);
  };

  t0 = performance.now();
  xhr.send();
}


function applyRotation(obj, roll, pitch, yaw) {
  if ( typeof(obj.initialRotation) != "undefined") {
    roll += obj.initialRotation.x;
    pitch += obj.initialRotation.y;
    yaw += obj.initialRotation.z;
  }

  obj.rotation.set(roll, pitch, yaw);
}
