"use strict"
import { Measure } from "../src/utils/Measure.js";

export class LaneSegments extends THREE.Object3D {
	constructor() {
		super()

		this.offsets = [];
		this.offsets.push(0)
		this.segments = [];
		this.outPoints = [];
		this.outPoints.push([])
		this.outValidities = [];
		this.outValidities.push([]);
	}

	initializeSegment(subName) { // have to be a callback?
		// Right Lane Segment or Left Lane Segment
		let laneSegment = new Measure();
		laneSegment.name = subName + this.offsets.length.toString();
		laneSegment.closed = false;
		laneSegment.showCoordinates = true;
		laneSegment.showAngles = true;

		this.segments.push(laneSegment);
		this.offsets.push(0);
		this.outPoints.push([]);
		this.outValidities.push([]);
	};

	finalizeSegment() {
		// add geometry object to this class (each measure object)
		this.add(this.segments[this.segments.length-1]);
	};

	incrementOffset(point, pointValidity) {
		// increment latest offset and add point to latest outPoints
		this.offsets[this.offsets.length-1] = this.offsets[this.offsets.length-1]+1;
		this.outPoints[this.outPoints.length-1].push({ position: point });
		this.outValidities[this.outValidities.length-1].push({ pointValidity: pointValidity });
	};

	addSegmentMarker(point) {
		// call addMarker for latest measure object
		this.segments[this.segments.length-1].addMarker(point);
	};

	getFinalPoints() {
		var finalPoints = [];
		var finalPointValidities = [];

		finalPoints = finalPoints.concat(this.outPoints[0]);
		finalPointValidities = finalPointValidities.concat(this.outValidities[0]);

		for (let si=0, sLen=this.segments.length; si<sLen; si++) {
			finalPoints = finalPoints.concat(this.segments[si].points);
			finalPoints = finalPoints.concat(this.outPoints[si+1]);

			const valids = Array(this.segments[si].points.length).fill(0);
			finalPointValidities = finalPointValidities.concat(valids);
			finalPointValidities = finalPointValidities.concat(this.outValidities[si+1]);

		}
		return {
			finalPoints: finalPoints,
			finalPointValidities: finalPointValidities
		};
	};

	updateSegments(clonedBoxes, prevIsContains, point, pointValidity, index, lengthArray) {
	  let newIsContains = false;
	  for (let bbi=0, bbLen=clonedBoxes.length; bbi<bbLen; bbi++) {
	    const isContains = clonedBoxes[bbi].containsPoint(new THREE.Vector3(point.x(), point.y(), point.z()));
	    if (isContains) {
	      newIsContains = isContains;
	    }
	  }
	  if (newIsContains && !prevIsContains) {
	    this.initializeSegment("Lane Segment "); // can pass as a parameter and differentiate between left and right, but not required for now
	  }
	  if (!newIsContains && prevIsContains) {
	    this.finalizeSegment();
	  }

	  if (newIsContains) {
	    this.addSegmentMarker(new THREE.Vector3(point.x(), point.y(), point.z()));
	  } else {
	    this.incrementOffset(new THREE.Vector3(point.x(), point.y(), point.z()), pointValidity);
	  }

	  // edge case if a segment exists at the end
	  if (newIsContains && index == lengthArray-1) {
	    this.finalizeSegment();
	  }

	  return newIsContains
	}

};
