$(document).ready(function () {

    var playbarhtml = $("#playbar");

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
        $( "#playbar_tmin" ).prop( "disabled", false ); //Enable
        $( "#playbar_tmax" ).prop( "disabled", false ); //Enable

        var sliderVal = $("#myRange").val() / 100.;
        var t = sliderVal * lidarRange + lidarOffset;
        $("#demo").html((t-lidarOffset).toFixed(4));

        // var dtMin = Number($("#playbar_tmin").val());
        // var dtMax = Number($("#playbar_tmax").val());

        const dtMin = window.animationEngine.activeWindow.backward;
        const dtMax = window.animationEngine.activeWindow.forward;

        tmin = t - dtMin;
        tmax = t + dtMax;

        window.viewer.setFilterGPSTimeRange(tmin, tmax);
      }
    }

    // Function to update slider:
    function updateSlider(slideval=null) {

      if (slideval) {
        var slider = playbarhtml.find("#myRange");
        slider.val(slideval);
      }

      updateClip();

    }

    playbarhtml.find("#playbar_tmin").on('input', function() {
      const tmin = playbarhtml.find("#playbar_tmin");
      window.animationEngine.activeWindow.backward = Math.abs(Number(tmin.val()));
      updateClip();
    });

    playbarhtml.find("#playbar_tmax").on('input', function() {
      const tmax = playbarhtml.find("#playbar_tmax");
      window.animationEngine.activeWindow.forward = Math.abs(Number(tmax.val()));
      updateClip();
    });

    playbarhtml.find("#elevation_max").on('input', function() {
      const elevationMax = playbarhtml.find("#elevation_max");
      window.elevationWindow[1] = Math.abs(Number(elevationMax.val()));
    });

    playbarhtml.find("#elevation_min").on('input', function() {
      const elevationMin = playbarhtml.find("#elevation_min");
      window.elevationWindow[0] = Math.abs(Number(elevationMin.val()));
    });

    playbarhtml.find("#myRange").on('input', function() {
      updateSlider();
    });

    playbarhtml.find("#myRange").on('wheel', function(e) {
      var slider = playbarhtml.find("#myRange");
      // var tmin = playbarhtml.find("#playbar_tmin");
      // var tmax = playbarhtml.find("#playbar_tmax");
      var slideval = Number(slider.val());
      var dy = e.originalEvent.deltaY;

      const tmin = window.animationEngine.activeWindow.backward;
      const tmax = window.animationEngine.activeWindow.forward;

      var scalefactor = 1;
      if (e.originalEvent.shiftKey) {
        scalefactor = .01;
        if (e.originalEvent.ctrlKey) { // shift and ctrl keys
          scalefactor = 100;
        }
      }

      var lidarRange = 1;
      try {
       // lidarRange = window.viewer.scene.pointclouds[0].pcoGeometry.nodes.r.gpsTime.range;
       lidarRange = window.animationEngine.timeRange;
     } catch (e) {
     }
      var stepY = 0;
      if (dy < 0) {
        // dt = Number(tmax.val());
        dt = tmax;
      } else if (dy > 0) {
        // dt = Number(tmin.val());
        dt = -tmin;
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
      updateClip(disable=this.checked);
    });
    playbarhtml.find("#playbar_toggle").trigger('click');

    playbarhtml.find("#playbutton").mousedown(function() {
      playbarhtml.find("#playbutton").hide();
      playbarhtml.find("#pausebutton").show();

    });

    playbarhtml.find("#pausebutton").mousedown(function() {
      playbarhtml.find("#playbutton").show();
      playbarhtml.find("#pausebutton").hide();

    });

    playbarhtml.find("#toggle_calibration_panels").mouseup(function() {

      // Find Calibration Panels:
      let panels = $(".draggable-overlay");
      for(ii=0, len=panels.length; ii<len; ii++) {

        let panel = panels[ii];

        // Check is visible and toggle:
        // panel.style.display = "none";
        // debugger;
        if (panel.style.display == "none") {
          panel.style.display = "block";
        } else {
          panel.style.display = "none"
        }

      }

    });

    window.addEventListener("message", e => {
     if (e.data === 'pause') {
       animationEngine.stop()
     }
   });

    $(document).tooltip();
});
