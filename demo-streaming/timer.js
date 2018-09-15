console.log("started heartbeat timer thread");

function sendAlert() {
  self.postMessage({
    msg: "alert"
  });
}

var dtMillis = 100;  // 10 Hz tick rate
setInterval(sendAlert, dtMillis);
