
function fetchData(s3, bucket, objectName, callback) {
  if (s3 && bucket && objectName) {
    s3.getObject({Bucket: bucket,
                  Key: objectName},
                 (err, data) => {
                   if (err) {
                     console.log(err, err.stack);
                   } else {

                     // TODO Binary vs string
                     debugger; 
                     const string = new TextDecoder().decode(data.Body);
                     const {mpos, orientations, t_init} = parseRTK(string);
                     callback(mpos, orientations, t_init);
                   }});
  } else {
    const filename = "csv/rtkdata.csv";
    let t0, t1;
    const tstart = performance.now();

    const xhr = new XMLHttpRequest();
    xhr.open("GET", filename);

    xhr.onprogress = function(event) {
      t1 = performance.now();
      console.log("Loaded ["+event.loaded+"] bytes in ["+(t1-t0)+"] ms")
      t0 = t1;
    }

    xhr.onload = function(data) {
      const {mpos, orientations, t_init} = parseRTK(data.target.response);
      console.log("Full Runtime: "+(performance.now()-tstart)+"ms");
      callback(mpos, orientations, t_init);
    };

    t0 = performance.now();
    xhr.send();
  }
}



function parsePolyline3D(flatbufferData) {
  // TODO
}
