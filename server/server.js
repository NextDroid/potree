var express = require('express');
var cors = require('cors');
var fs = require('fs');
var ReadStream = require("fs-readstream-seek");
app = express();
var port = 4321;
var filename = __dirname + "/../data/cloud-18M-data.pcd";

app.use(cors());


function sendFile(filename, req, res, seekPos) {
  fs.stat(filename, function(err, stat) {
    if (err == null) {
      console.log("File exists");
      // console.log(stat);

      // Set Headers:
      res.setHeader('Access-Control-Allow-Origin', "*"); // Set CORS
      res.setHeader('Access-Control-Allow-Headers', req.headers.origin); // Set CORS
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', stat.size);
      console.log("filesize: " + stat.size);

      var stream = new ReadStream(filename);
      stream.seek(seekPos);
      stream.pipe(res);

    } else {
      console.log("File does not exist");
    }
  });
}

app.get("/*", function(req, res) {
  console.log("request received!");
  console.log(req.params[0]);

  // If header was requested:
  if (req.params[0].includes("args/header")) {
    console.log("try to send header for: ", req.params[0].split('/')[2]);
    var fname = __dirname + "/../data/" + req.params[0].split('/')[2];
    var seekPos = 0;
    sendFile(fname, req, res, seekPos);
  }

  // If data was requested:
  if (req.params[0].includes("args/data")) {
    console.log("try to send data for: ", req.params[0].split('/')[2]);
    var fname = __dirname + "/../data/" + req.params[0].split('/')[2];
    var seekPos = parseInt(req.headers["x-seek-position"]);
    console.log("seek position: ", seekPos);
    sendFile(fname, req, res, seekPos);
  }

});

app.listen(port, () => {
  console.log("Server running on port: " + port);
});
