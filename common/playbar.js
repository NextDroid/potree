$(document).ready(function () {

  // Insert HTML for Playbar:
  var playbarhtml = $(`
    <div class="overlay">
      <div class="slidecontainer">
        <input type="range" min="0" max="100" value=0 step="any" class="slider" id="myRange">
        <div id="spacer">

          <div id="value" class="inline">
            <input type="checkbox" id="toggleplay">
            <button class="button" class="play" id="playbutton" class="inline"><i class="material-icons">play_arrow</i></button>
            <button class="button" class="pause" id="pausebutton"><i class="material-icons">pause</i></button>
            Time: <span id="demo">0.0000</span> seconds
            <span id="playbar_timewindows">
              <input type="number" id="playbar_tmin" value=-0.05 max=0 step="0.01">
              <input type="number" id="playbar_tmax" value=0.05 min=0 step="0.01">
            </span>
            <label class="switch">
              <input type="checkbox" id="playbar_toggle">
              <span class="toggleslider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
    `);

    // Add to DOM:
    $("#potree_render_area").append(playbarhtml);

    // Define function to update clip range:
    function updateClip(disable=false) {

      console.log(window.viewer.scene); // gpstime
      var lidarOffset = window.viewer.scene.pointclouds[0].pcoGeometry.nodes.r.gpsTime.offset;

      // lidarOffset = 1495189467.550001;  // TODO Hardcoded b/c PotreeConverter is throwing away initial offset
      var lidarRange = window.viewer.scene.pointclouds[0].pcoGeometry.nodes.r.gpsTime.range;

      if (disable) {
        // NOTE: is there a better way of disabling the gps clip range filter?
        window.viewer.setFilterGPSTimeRange(lidarOffset-1, lidarOffset+lidarRange+1);
        $( "#playbar_tmin" ).prop( "disabled", true ); //Disable
        $( "#playbar_tmax" ).prop( "disabled", true ); //Disable

      } else {
        $( "#playbar_tmin" ).prop( "disabled", false ); //Enable
        $( "#playbar_tmax" ).prop( "disabled", false ); //Enable

        var sliderVal = $("#myRange").val() / 100.;
        var t = sliderVal * lidarRange + lidarOffset;
        $("#demo").html((t-lidarOffset).toFixed(4));
        console.log(document.getElementById("demo").innerHTML);

        var dtMin = Number($("#playbar_tmin").val());
        var dtMax = Number($("#playbar_tmax").val());

        tmin = t + dtMin;
        tmax = t + dtMax;

        window.viewer.setFilterGPSTimeRange(tmin, tmax);
      }
    }

    // Function to update slider:
    function updateSlider(slideval=null) {

      if (slideval) {
        var slider = playbarhtml.find("#myRange");
        slider.val(slideval);
        console.log("New Value: ", slider.val());
      }

      updateClip();

    }

    playbarhtml.find("#playbar_tmin").on('input', function() {
      console.log("TMIN");
      updateClip();
    });

    playbarhtml.find("#playbar_tmax").on('input', function() {
      console.log("TMAX");
      updateClip();
    });

    playbarhtml.find("#myRange").on('input', function() {
      console.log("SLIDER");

      updateSlider();
    });

    playbarhtml.find("#myRange").on('wheel', function(e) {
      console.log("SCROLL");
      console.log(e.originalEvent.deltaY);
      var slider = playbarhtml.find("#myRange");
      var tmin = playbarhtml.find("#playbar_tmin");
      var tmax = playbarhtml.find("#playbar_tmax");
      var slideval = Number(slider.val());
      var dy = e.originalEvent.deltaY;

      var scalefactor = 1;
      console.log(e.originalEvent.shiftKey);
      if (e.originalEvent.shiftKey) {
        scalefactor = .01;
        if (e.originalEvent.ctrlKey) { // shift and ctrl keys
          scalefactor = 100;
        }
      }

      var lidarRange = 1;
      try {
       lidarRange = window.viewer.scene.pointclouds[0].pcoGeometry.nodes.r.gpsTime.range;
     } catch (e) {
       console.log(e);
     }
      var stepY = 0;
      if (dy < 0) {
        dt = Number(tmax.val());
      } else if (dy > 0) {
        dt = Number(tmin.val());
      }
      dt = dt*scalefactor;
      var sliderange = Number(slider.attr("max")) - Number(slider.attr("min"));
      var stepY = sliderange*dt/lidarRange;

      slideval += stepY;

      updateSlider(slideval);
    });
    playbarhtml.find("#myRange").on("scroll", function(e) {
      console.log(e);
    });

    playbarhtml.find("#playbar_toggle").click(function() {
      console.log("Temp Button");
      updateClip(disable=this.checked);
    });
    playbarhtml.find("#playbar_toggle").trigger('click');

    playbarhtml.find("#playbutton").mousedown(function() {
      console.log("PLAY");
      playbarhtml.find("#playbutton").hide();
      playbarhtml.find("#pausebutton").show();

    });

    playbarhtml.find("#pausebutton").mousedown(function() {
      console.log("PAUSE");
      playbarhtml.find("#playbutton").show();
      playbarhtml.find("#pausebutton").hide();

    });

    window.addEventListener("keypress", (e) => {
      console.log("keypress");
      console.log(e);
      if (e.charCode == 32) {
        console.log("SPACEBAR");
        var toggleplay = playbarhtml.find("#toggleplay");
        toggleplay.trigger('click');
          if (toggleplay.is(":checked")) {
            playbarhtml.find("#playbutton").trigger('mousedown');
          } else {
            playbarhtml.find("#pausebutton").trigger('mousedown');
          }
        }
    });



});