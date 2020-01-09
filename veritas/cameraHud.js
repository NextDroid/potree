export function setupCameraHud (cameraFiles) {
  // Create HTML elements
  const cameraHudToggleButton = $(
    `<div id="camera_hud_toggle_button"><i class="material-icons-outlined">videocam</i></div>`);
  cameraHudToggleButton.click(toggleCameraHud);

  const cameraHtmls = cameraFiles.map(({ number, url }) => {
    $(`<video class="camera" src="${url.escape()}" title="Camera ${number}" controls />`);
  });

  const cameraHudHtml = $(`<div id="camera_hud_overlay"></div>`);
  for (const cameraHtml of cameraHtmls) {
    cameraHudHtml.appendChild(cameraHtml);
  }
  cameraHudHtml.hide();

  let showCameraHud = false;

  function setShowCameraHud (newShowCamera) {
    showCameraHud = newShowCamera;
    if (newShowCamera) {
      cameraHudHtml.show();
    } else {
      cameraHudHtml.hide();
    }
  }

  function toggleCameraHud () {
    setShowCameraHud(!showCameraHud);
  }

  // Add to DOM:
  $('#potree_render_area').append(cameraHudToggleButton);
  $('#potree_render_area').append(cameraHudHtml);
}