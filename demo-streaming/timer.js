console.log("started heartbeat timer thread");

function sendAlert() {
  self.postMessage({
    msg: "alert"
  });
}

var dtMillis = 1000;  // 20 Hz tick rate
setInterval(sendAlert, dtMillis);
