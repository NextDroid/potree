$(document).ready(function () {

  // Insert HTML for Playbar:
  var loadingscreen = $(`
      <table id="loading-overlay-table">
        <tr style="vertical-align: bottom;"><td>
          <div id="loading_overlay">
            <div id="loading-bar" class="ldBar label-center" data-preset="circle" data-stroke="data:ldbar/res,gradient(0,1,#f99,#ff9)" data-value="0">
            </div>
          </div>
        </td></tr>
        <tr><td>
          <p class='loading_text' id='loading-text'></p>
        </td></tr>
      </table>`);


  // Add to DOM:
  $('body').prepend(loadingscreen);

  // // NOTE: using https://loadingbar.io/progress
  // const loadingBar = new ldBar("#loading-bar"); // TODO not used -- how to export loadingBar variable?

});

export function setLoadingScreen(message) {
  window.loadingScreenUp = true;
  window.numLoadingScreens = window.numLoadingScreens ? window.numLoadingScreens+1 : 1;
  document.getElementById("loading-overlay-table").style.display = "table";
  document.getElementById("loading-text").style.display = "block";
  setLoadingScreenMessage(message);
  debugger;
}

export function setLoadingScreenMessage(message) {
  document.getElementById("loading-text").innerHTML = message ? message : "Loading and processing data";
}

export function removeLoadingScreen() {
  window.numLoadingScreens = window.numLoadingScreens ? window.numLoadingScreens-1 : 0;
  if (!window.numLoadingScreens) {
    window.loadingScreenUp = false;
    document.getElementById("loading-overlay-table").style.display = "none";
  }
  debugger;
}

export function getLoadingBar() {
  // NOTE: using https://loadingbar.io/progress
  const loadingBar = new ldBar("#loading-bar");
  return loadingBar;
}
