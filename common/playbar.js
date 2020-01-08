$(document).ready(function () {

  // Insert HTML for Playbar:
  var playbarhtml = $(`
    <div class="overlay">
      <div class="slidecontainer">
        <div class="slider" id="timeSlider"></div>
        <div class="slider" id="intervalSlider"></div>
      </div>
      <div id="spacer"></div>

      <div id="value" class="playbar_row">
        <div id="play_pause_container" class="value_column">
          <button class="play_pause_button" class="play" id="playbutton"><i class="material-icons">play_arrow</i></button>
          <button class="play_pause_button" class="pause" id="pausebutton" style="display: none"><i class="material-icons">pause</i></button>
        </div>
        
        <div id="time_display_container" class="value_column">
          <div class="time_display_section">Time (region): <input type="number" id="time_display" class="playbar_text_field" min=0 value=0 step="0.0001" /> (s)</div>
          <div class="time_display_section">Time (global): <input type="number" id="full_time_display" class="playbar_text_field" min=0 value=0 step="0.0001" readonly/> (s)</div>
        </div>

        <table id="windows" class="value_column">
          <tr>
            <td class="align_right">Time Window:</td>
            <td class="window">[<input type="number" id="playbar_tmin" class="playbar_text_field" value=-0.05 max=0 step="0.01">, <input type="number" id="playbar_tmax" class="playbar_text_field" value=0.05 min=0 step="0.01">]</td>
            <td>(s)</td>
          </tr>
          <tr>
            <td class="align_right">Elevation Window:</td>
            <td class="window">[<input type="number" id="elevation_min" class="playbar_text_field" value=-0.5 max=0 step="0.01">, <input type="number" id="elevation_max" class="playbar_text_field" value=0.5 min=0 step="0.01">]</td>
            <td>(m)</td>
          </tr>
        </table>
      </div>

      <div class="playbar_row">
        <button class="box_button" name="toggle_calibration_panels" id="toggle_calibration_panels">Toggle Calibration Panels</button>
        <button class="box_button" name="toggle_hideshow" id="toggle_hideshow">Toggle Pointcloud Highlight Mode</button>
        <button class="box_button" name="load_detections_button" id="load_detections_button">Load Detections</button>
        <button class="box_button" name="load_gaps_button" id="load_gaps_button">Load Gaps</button>
        <button class="box_button" name="load_radar_button" id="load_radar_button">Load Radar</button>
        <button class="box_button" name="download_lanes_button" id="download_lanes_button">Download Lanes</button>
        <button class="box_button" name="reload_lanes_button" id="reload_lanes_button">Annotate Lanes</button>
      </div>
    </div>
    `);

    // Add to DOM:
    $("#potree_render_area").append(playbarhtml);

    // Define function to update clip range:
    function updateClip(disable=false) {

      const lidarOffset = window.animationEngine.tstart;
      const lidarRange = window.animationEngine.timeRange;

      if (disable) {
        // NOTE: is there a better way of disabling the gps clip range filter?
        window.viewer.setFilterGPSTimeRange(lidarOffset-1, lidarOffset+lidarRange+1);
        $( "#playbar_tmin" ).prop( "disabled", true ); //Disable
        $( "#playbar_tmax" ).prop( "disabled", true ); //Disable

      } else {
        $("#playbar_tmin").prop("disabled", false) //Enable
        $("#playbar_tmax").prop("disabled", false) //Enable

        var t = $("#timeSlider").val()
        $("#demo").html((t - lidarOffset).toFixed(4))

        // var dtMin = Number($("#playbar_tmin").val());
        // var dtMax = Number($("#playbar_tmax").val());

        const dtMin = window.animationEngine.activeWindow.backward
        const dtMax = window.animationEngine.activeWindow.forward

        tmin = t - dtMin
        tmax = t + dtMax

        window.viewer.setFilterGPSTimeRange(tmin, tmax)
      }
    }

    // Function to update slider:
    function updateSlider(slideval=null) {

      if (slideval) {
        var slider = playbarhtml.find("#timeSlider")
        slider.val(slideval)
      }

      updateClip()

    }

  playbarhtml.find("#playbar_tmin").on('input', function () {
    const tmin = playbarhtml.find("#playbar_tmin")
    window.animationEngine.activeWindow.backward = Math.abs(Number(tmin.val()))
    updateClip()
    window.animationEngine.updateTimeForAll()
  })

  playbarhtml.find("#playbar_tmax").on('input', function () {
    const tmax = playbarhtml.find("#playbar_tmax")
    window.animationEngine.activeWindow.forward = Math.abs(Number(tmax.val()))
    updateClip()
    window.animationEngine.updateTimeForAll()
  })

  playbarhtml.find("#elevation_max").on('input', function () {
    const elevationMax = playbarhtml.find("#elevation_max")
    window.elevationWindow[1] = Math.abs(Number(elevationMax.val()))
  })

  playbarhtml.find("#elevation_min").on('input', function () {
    const elevationMin = playbarhtml.find("#elevation_min")
    window.elevationWindow[0] = Math.abs(Number(elevationMin.val()))
  })

  playbarhtml.find("#playbar_toggle").click(function () {
    updateClip(disable = this.checked)
  })
  playbarhtml.find("#playbar_toggle").trigger('click')

  playbarhtml.find("#playbutton").mousedown(function () {
    playbarhtml.find("#playbutton").hide()
    playbarhtml.find("#pausebutton").show()

  })

  playbarhtml.find("#pausebutton").mousedown(function () {
    playbarhtml.find("#playbutton").show()
    playbarhtml.find("#pausebutton").hide()

  })

  playbarhtml.find("#toggle_calibration_panels").mouseup(function () {

    // Find Calibration Panels:
    let panels = $(".draggable-overlay")
    for (ii = 0, len = panels.length; ii < len; ii++) {

      let panel = panels[ii]

      // Check is visible and toggle:
      if (panel.style.display == "none" || panel.style.display == "") {
        panel.style.display = "block"
      } else {
        panel.style.display = "none"
      }

    }

    });

    playbarhtml.find("#download_lanes_button").click(function() {

      function download(text, filename) {

        let blob = new Blob([text], {
          type: "data:text/plain;charset=utf-8"
        })

        let fileUrl = URL.createObjectURL(blob)

        var element = document.createElement('a');
        element.setAttribute('href', fileUrl)
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }

      // Download Left Lane Vertices:
      try {
        const laneLeftSegments = window.viewer.scene.scene.getChildByName("Left Lane Segments");
        if (laneLeftSegments == undefined) {
          const laneLeft = window.viewer.scene.scene.getChildByName("Lane Left");
          download(JSON.stringify(laneLeft.points, null, 2), "lane-left.json");
        } else {
          download(JSON.stringify(laneLeftSegments.getFinalPoints(), null, 2), "lane-left.json");
        }

      } catch (e) {
        console.error("Couldn't download left lane vertices: ", e);
      }

      // Download Lane Spine Vertices:
      try {
        const laneSpine = window.viewer.scene.scene.getChildByName("Lane Spine");
        download(JSON.stringify(laneSpine.points, null, 2), "lane-spine.json", "text/plain");
      } catch (e) {
        console.error("Couldn't download lane spine vertices: ", e);
      }

      // Download Right Lane Vertices:
      try {
        const laneRightSegments = window.viewer.scene.scene.getChildByName("Right Lane Segments");
        if (laneRightSegments == undefined) {
          const laneRight = window.viewer.scene.scene.getChildByName("Lane Right");
          download(JSON.stringify(laneRight.points, null, 2), "lane-right.json", "text/plain");
        } else {
          download(JSON.stringify(laneRightSegments.getFinalPoints(), null, 2), "lane-right.json", "text/plain");
        }
      } catch (e) {
        console.error("Couldn't download right lane vertices: ", e);
      }




    });

    window.addEventListener("message", e => {
     if (e.data === 'pause') {
       animationEngine.stop()
     }
    });

    playbarhtml.find("#toggle_hideshow").click(function() {
      for (let cloud of window.viewer.scene.pointclouds) {
        cloud.material.uniforms.uExtrinsicsMode.value = !cloud.material.uniforms.uExtrinsicsMode.value;
      }
    });

    $(document).tooltip();

    // Configure Playbar Appearance:
    // document.getElementById("playbar_tmin").style.display = "none";
    // document.getElementById("playbar_tmax").style.display = "none";
    // document.getElementById("elevation_max").style.display = "none";
    // document.getElementById("elevation_min").style.display = "none";
    // document.getElementById("toggle_calibration_panels").style.display = "none";
    document.getElementById("load_detections_button").style.display = "none";
    document.getElementById("load_gaps_button").style.display = "none";
    document.getElementById("download_lanes_button").style.display = "none";
});
