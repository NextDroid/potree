const { DirectFileSequence, ProcessFileSequence, SequencePlayer } = window.sequencePlayer;

const sequenceFps = 30;

export class CameraHud {
  constructor ({ s3, bucket, cameraImageSequenceConfig }) {
    // Create HTML elements
    const cameraHudIcon = document.createElement('i');
    cameraHudIcon.classList.add('material-icons-outlined');
    cameraHudIcon.innerText = 'videocam';

    this.cameraHudToggleButton = document.createElement('div');
    this.cameraHudToggleButton.id = 'camera_hud_toggle_button';
    this.cameraHudToggleButton.appendChild(cameraHudIcon);
    this.cameraHudToggleButton.addEventListener('click', () => this.toggleCameraHud());

    this.cameraHudCanvas = document.createElement('canvas');
    this.cameraHudCanvas.id = 'camera_hud';
    this.cameraHudCanvas.hidden = true;

    // Create sequence video
    const fileSequence = new ProcessFileSequence({
      wrapped: new DirectFileSequence(cameraImageSequenceConfig),
      processPath: key => new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', {
          Bucket: bucket, Key: key
        }, (error, url) => {
          if (error) {
            reject(error);
          } else {
            resolve(url);
          }
        });
      })
    });
    this.sequencePlayer = new SequencePlayer({
      inputStream: {
        fps: sequenceFps, fileSequence
      }, canvas: this.cameraHudCanvas
    });
  }

  getShowCameraHud () {
    return this.cameraHudCanvas.hidden;
  }

  setShowCameraHud (newShowCamera) {
    this.cameraHudCanvas.hidden = newShowCamera;
  }

  toggleCameraHud () {
    this.setShowCameraHud(!this.getShowCameraHud());
  }

  addToDom () {
    // Add to DOM:
    const container = document.getElementById('potree_render_area');
    container.appendChild(this.cameraHudToggleButton);
    container.appendChild(this.cameraHudCanvas);
  }

  setCurrentTime (currentTime) {
    this.sequencePlayer.setCurrentTime(currentTime);
  }
}