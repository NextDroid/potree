'use strict';

export class AnimationEngine {

  constructor(initialValues) {

    // TODO Use TWEEN.Group()....doesn't work though...why? It's in the documentation
    // this.tweenGroup = TWEEN.Group(); // Tween Group containing all animated objects
    this.tstart = undefined;  // Starting time for animation (reference time, aka GPS Time)
    this.tend = undefined;  // Ending time for animation (reference time, aka GPS Time)
    this.timeline = undefined;

    // Make copies of initial values, so they can be modified
    // Defines the size of the window around around the current time step
    this.activeWindow = this.initValues(initialValues.activeWindow)
    this.elevationWindow = this.initValues(initialValues.elevationWindow)
    this.timeRange = undefined;
    this.preStartCallback = undefined; // Callback run before start() executes
    this.preStopCallback = undefined; // Callback run before stop() executes
    this.repeat = true; // Whether to repeat;
    this.playbackRate = 1.0;  // Speed of animation compared to realtime speed
    this.tweenEngine = undefined; // Linear Tween between tstart and tend that controls all other tweens
    this.tweenTargets = []; // List of custom update functions for all targets - called by tweenEngine
    this.isPlaying = false;
  }

  initValues(dict) {
    const toRtn = {} 
    for (const [key, val] of Object.entries(dict)) {
      // causes issues if not a Number
      toRtn[key] = Number(val)
    }
    return toRtn
  }

  configure(tstart, tend, playbackRate, tweenTargets, repeat) {
    this.tstart = tstart;
    this.tend = tend;
    this.timeline = {t: tstart};
    this.timeRange = Math.abs(tend - tstart);

    // Default Parameters:
    this.playbackRate = playbackRate || this.playbackRate;
    this.tweenTargets = tweenTargets || this.tweenTargets;
    this.repeat = repeat || this.repeat;
  }

  launch() {
    const timeRemaining = Math.abs(this.tend - this.timeline.t);
    const durationMillis = timeRemaining*1000/this.playbackRate;

    this.tweenEngine = new TWEEN.Tween(this.timeline).to({t:this.tend}, durationMillis);
    this.tweenEngine.easing(TWEEN.Easing.Linear.None);
    this.tweenEngine.onUpdate(() => this.updateTimeForAll(true));
    this.tweenEngine.onComplete(() => {
      if (this.repeat) {
        this.timeline.t = this.tstart;
        this.launch();
      }
    });
    // this.tweenEngine.start();
  }

  // TODO don't use callback, already exists with onStart()
  start() {
    this.launch();
    if (this.preStartCallback) {
      this.preStartCallback();
    }
    this.tweenEngine.start();
    this.isPlaying = true;
  }

  // TODO don't use callback, already exists with onStop()
  stop() {
    if (this.preStopCallback) {
      this.preStopCallback();
    }
    this.tweenEngine.stop();
    this.isPlaying = false;
  }

  // TODO not sure this ever gets called, and not sure it does anything when it is called
  update() {
    let t = (this.timeline.t - this.tstart) / this.timeRange;
    this.tweenEngine.update(t);
  }

  updateTimeForAll(updateDisplayedTime) {
    // Update all targets with current time
    for(let ii=0, len=this.tweenTargets.length; ii<len; ii++) {
      this.tweenTargets[ii](this.timeline.t, updateDisplayedTime);
    }
  }
}
