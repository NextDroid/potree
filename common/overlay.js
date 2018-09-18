$(document).ready(function () {

  // Insert HTML for Playbar:
  var loadingscreen = $(`
    <div id="loading_overlay">
      <div class="loading_text">
        <p>LOADING</p>
      </div>
    </div>`);

  // Add to DOM:
  $('body').prepend(loadingscreen);
});

function setLoadingScreen() {
  document.getElementById("loading_overlay").style.display = "block";
}

function removeLoadingScreen() {
  document.getElementById("loading_overlay").style.display = "none";
}
