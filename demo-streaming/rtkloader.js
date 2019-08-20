
function isNan(n) {
  return n !== n;
}

function minAngle(theta) {
  if (theta < - Math.PI) {
    theta += 2*Math.PI;
  }
  if (theta > Math.PI) {
    theta -= 2*Math.PI;
  }
  return theta;
}

function loadRtk(filename, isODC, callback) {

  // let filename = "http://172.18.44.138:4321/rtk.csv";
  console.log("RTK Filename: ", filename);
  let tcol, xcol, ycol, zcol, yawcol, pitchcol, rollcol, validCol;

  if (isODC) {
    tcol = 1;       // GPS_TIME
    // tcol = 3;       // SYSTEM_TIME
    xcol = 12;      // RTK_EASTING_M
    ycol = 13;      // RTK_NORTHING_M
    zcol = 14;      // RTK_ALT_M
    yawcol = 15;    // ADJUSTED_HEADING_RAD
    pitchcol = 16;  // PITCH_RAD
    rollcol = 17;   // ROLL_RAD
    validCol = tcol; // not in ODC data
  } else {
    tcol = 0;       // timestamp
    xcol = 3;       // easting
    ycol = 4;       // northing
    zcol = 5;       // altitude
    yawcol = 14;    // heading
    pitchcol = 15;  // pitch
    rollcol = 16;   // roll
    validCol = 20;  // isValid
  }




  let t0, t1;
  let tstart = performance.now();
  let distance = 0; // total distance of path

  console.log("Loading RTK File");

  const xhr = new XMLHttpRequest();
  xhr.open("GET", filename);

  xhr.onerror = function() {
    console.error("Error loading RTK file: ", xhr);
  }

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

    let rtkLookup = [];


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
        valid = cols[validCol] == 1;


        if (isNan(t) || isNan(x) || isNan(y) || isNan(z) || !valid) {
          // skip
          continue;
        }

        if (firstTimestamp) {
          t_init = t;
          firstTimestamp = false;
          pos_init = [x, y, z];
          orientation_init = [roll, pitch, yaw];
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
        timestamps.push(t);
        positions.push(x);
        positions.push(y);
        positions.push(z);
        colors.push( Math.random() * 0xffffff );
        colors.push( Math.random() * 0xffffff );
        colors.push( Math.random() * 0xffffff );
        mpos.push([x,y,z]);

        // Append into RTK Lookup Object:
        rtkLookup.push({
          position: [
            x-pos_init[0],
            y-pos_init[1],
            z-pos_init[2]
          ],
          orientation: [
            minAngle(roll-orientation_init[0]),
            minAngle(pitch-orientation_init[1]),
            minAngle(yaw-orientation_init[2])
          ],
          time: t-t_init
        });

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

    // TODO load calibrations
    rtk2vehicle = {
      x: 0,
      y: 0,
      z: 0,
      roll: 0,
      pitch: 0,
      yaw: 1.6232
    }
    callback(mpos, orientations, timestamps, t_init, t_range, numPoints, distance, rtkLookup, pos_init, orientation_init, rtk2vehicle);
  };

  t0 = performance.now();
  xhr.send();
}
