// automatically generated by the FlatBuffers compiler, do not modify

/**
 * @const
 * @namespace
 */
var Flatbuffer = Flatbuffer || {};

/**
 * @const
 * @namespace
 */
Flatbuffer.ControllerDataLG = Flatbuffer.ControllerDataLG || {};

/**
 * @enum {number}
 */
Flatbuffer.ControllerDataLG.Mode = {
  INIT: 0,
  MANUAL: 1,
  LANE_CENTERING: 2,
  LEFT_ALC_STANDBY: 3,
  LEFT_ALC_PREDECISION: 4,
  LEFT_ALC_ACTION: 5,
  LEFT_ALC_LANEJUMP: 6,
  RIGHT_ALC_STANDBY: 7,
  RIGHT_ALC_PREDECISION: 8,
  RIGHT_ALC_ACTION: 9,
  RIGHT_ALC_LANEJUMP: 10
};

/**
 * @enum {string}
 */
Flatbuffer.ControllerDataLG.ModeName = {
  '0': 'INIT',
  '1': 'MANUAL',
  '2': 'LANE_CENTERING',
  '3': 'LEFT_ALC_STANDBY',
  '4': 'LEFT_ALC_PREDECISION',
  '5': 'LEFT_ALC_ACTION',
  '6': 'LEFT_ALC_LANEJUMP',
  '7': 'RIGHT_ALC_STANDBY',
  '8': 'RIGHT_ALC_PREDECISION',
  '9': 'RIGHT_ALC_ACTION',
  '10': 'RIGHT_ALC_LANEJUMP'
};

/**
 * @enum {number}
 */
Flatbuffer.ControllerDataLG.LaneType = {
  WHITE_DASHED: 0,
  WHITE_DOUBLE_LANE_MARK_DASHED_ON_ONE_SIDE: 1,
  WHITE_SOLID: 2,
  UNDECIDED: 3,
  ROAD_EDGE: 4,
  YELLOW_DASHED: 5,
  YELLOW_DOUBLE_LANE_MARK_DASHED_ON_ONE_SIDE: 6,
  YELLOW_SOLID: 7
};

/**
 * @enum {string}
 */
Flatbuffer.ControllerDataLG.LaneTypeName = {
  '0': 'WHITE_DASHED',
  '1': 'WHITE_DOUBLE_LANE_MARK_DASHED_ON_ONE_SIDE',
  '2': 'WHITE_SOLID',
  '3': 'UNDECIDED',
  '4': 'ROAD_EDGE',
  '5': 'YELLOW_DASHED',
  '6': 'YELLOW_DOUBLE_LANE_MARK_DASHED_ON_ONE_SIDE',
  '7': 'YELLOW_SOLID'
};

/**
 * @constructor
 */
Flatbuffer.ControllerDataLG.ALC = function() {
  /**
   * @type {flatbuffers.ByteBuffer}
   */
  this.bb = null;

  /**
   * @type {number}
   */
  this.bb_pos = 0;
};

/**
 * @param {number} i
 * @param {flatbuffers.ByteBuffer} bb
 * @returns {Flatbuffer.ControllerDataLG.ALC}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.isOperating = function() {
  return !!this.bb.readInt8(this.bb_pos);
};

/**
 * @param {boolean} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_isOperating = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 0);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.isLaneChanging = function() {
  return !!this.bb.readInt8(this.bb_pos + 1);
};

/**
 * @param {boolean} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_isLaneChanging = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 1);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {Flatbuffer.ControllerDataLG.Mode}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mode = function() {
  return /** @type {Flatbuffer.ControllerDataLG.Mode} */ (this.bb.readInt8(this.bb_pos + 2));
};

/**
 * @param {Flatbuffer.ControllerDataLG.Mode} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_mode = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 2);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.isLeftIndicatorOn = function() {
  return !!this.bb.readInt8(this.bb_pos + 3);
};

/**
 * @param {boolean} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_isLeftIndicatorOn = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 3);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.isRightIndicatorOn = function() {
  return !!this.bb.readInt8(this.bb_pos + 4);
};

/**
 * @param {boolean} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_isRightIndicatorOn = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 4);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.leftLaneMarkerQuality = function() {
  return this.bb.readInt8(this.bb_pos + 5);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_leftLaneMarkerQuality = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 5);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.rightLaneMarkerQuality = function() {
  return this.bb.readInt8(this.bb_pos + 6);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_rightLaneMarkerQuality = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 6);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {Flatbuffer.ControllerDataLG.LaneType}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.leftLaneMarkerType = function() {
  return /** @type {Flatbuffer.ControllerDataLG.LaneType} */ (this.bb.readInt8(this.bb_pos + 7));
};

/**
 * @param {Flatbuffer.ControllerDataLG.LaneType} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_leftLaneMarkerType = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 7);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {Flatbuffer.ControllerDataLG.LaneType}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.rightLaneMarkerType = function() {
  return /** @type {Flatbuffer.ControllerDataLG.LaneType} */ (this.bb.readInt8(this.bb_pos + 8));
};

/**
 * @param {Flatbuffer.ControllerDataLG.LaneType} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_rightLaneMarkerType = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 8);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.lcaTimer = function() {
  return this.bb.readInt32(this.bb_pos + 12);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_lca_timer = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 12);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt32(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.speed = function() {
  return this.bb.readInt32(this.bb_pos + 16);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_speed = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 16);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt32(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.acceleration = function() {
  return this.bb.readInt32(this.bb_pos + 20);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.ControllerDataLG.ALC.prototype.mutate_acceleration = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 20);

  if (offset === 0) {
    return false;
  }

  this.bb.writeInt32(this.bb_pos + offset, value);
  return true;
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {boolean} isOperating
 * @param {boolean} isLaneChanging
 * @param {Flatbuffer.ControllerDataLG.Mode} mode
 * @param {boolean} isLeftIndicatorOn
 * @param {boolean} isRightIndicatorOn
 * @param {number} leftLaneMarkerQuality
 * @param {number} rightLaneMarkerQuality
 * @param {Flatbuffer.ControllerDataLG.LaneType} leftLaneMarkerType
 * @param {Flatbuffer.ControllerDataLG.LaneType} rightLaneMarkerType
 * @param {number} lca_timer
 * @param {number} speed
 * @param {number} acceleration
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.ControllerDataLG.ALC.createALC = function(builder, isOperating, isLaneChanging, mode, isLeftIndicatorOn, isRightIndicatorOn, leftLaneMarkerQuality, rightLaneMarkerQuality, leftLaneMarkerType, rightLaneMarkerType, lca_timer, speed, acceleration) {
  builder.prep(4, 24);
  builder.writeInt32(acceleration);
  builder.writeInt32(speed);
  builder.writeInt32(lca_timer);
  builder.pad(3);
  builder.writeInt8(rightLaneMarkerType);
  builder.writeInt8(leftLaneMarkerType);
  builder.writeInt8(rightLaneMarkerQuality);
  builder.writeInt8(leftLaneMarkerQuality);
  builder.writeInt8(+isRightIndicatorOn);
  builder.writeInt8(+isLeftIndicatorOn);
  builder.writeInt8(mode);
  builder.writeInt8(+isLaneChanging);
  builder.writeInt8(+isOperating);
  return builder.offset();
};

/**
 * @constructor
 */
Flatbuffer.ControllerDataLG.ALCs = function() {
  /**
   * @type {flatbuffers.ByteBuffer}
   */
  this.bb = null;

  /**
   * @type {number}
   */
  this.bb_pos = 0;
};

/**
 * @param {number} i
 * @param {flatbuffers.ByteBuffer} bb
 * @returns {Flatbuffer.ControllerDataLG.ALCs}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @param {flatbuffers.ByteBuffer} bb
 * @param {Flatbuffer.ControllerDataLG.ALCs=} obj
 * @returns {Flatbuffer.ControllerDataLG.ALCs}
 */
Flatbuffer.ControllerDataLG.ALCs.getRootAsALCs = function(bb, obj) {
  return (obj || new Flatbuffer.ControllerDataLG.ALCs).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @param {flatbuffers.ByteBuffer} bb
 * @param {Flatbuffer.ControllerDataLG.ALCs=} obj
 * @returns {Flatbuffer.ControllerDataLG.ALCs}
 */
Flatbuffer.ControllerDataLG.ALCs.getSizePrefixedRootAsALCs = function(bb, obj) {
  return (obj || new Flatbuffer.ControllerDataLG.ALCs).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.time = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? this.bb.readUint32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.timeLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Uint32Array}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.timeArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? new Uint32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @param {flatbuffers.Encoding=} optionalEncoding
 * @returns {string|Uint8Array}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.niTime = function(index, optionalEncoding) {
  var offset = this.bb.__offset(this.bb_pos, 6);
  return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.niTimeLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 6);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @param {number} index
 * @param {Flatbuffer.ControllerDataLG.ALC=} obj
 * @returns {Flatbuffer.ControllerDataLG.ALC}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.alcS = function(index, obj) {
  var offset = this.bb.__offset(this.bb_pos, 8);
  return offset ? (obj || new Flatbuffer.ControllerDataLG.ALC).__init(this.bb.__vector(this.bb_pos + offset) + index * 24, this.bb) : null;
};

/**
 * @returns {number}
 */
Flatbuffer.ControllerDataLG.ALCs.prototype.alcSLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 8);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @param {flatbuffers.Builder} builder
 */
Flatbuffer.ControllerDataLG.ALCs.startALCs = function(builder) {
  builder.startObject(3);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} timeOffset
 */
Flatbuffer.ControllerDataLG.ALCs.addTime = function(builder, timeOffset) {
  builder.addFieldOffset(0, timeOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.ControllerDataLG.ALCs.createTimeVector = function(builder, data) {
  builder.startVector(4, data.length, 4);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addInt32(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.ControllerDataLG.ALCs.startTimeVector = function(builder, numElems) {
  builder.startVector(4, numElems, 4);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} niTimeOffset
 */
Flatbuffer.ControllerDataLG.ALCs.addNiTime = function(builder, niTimeOffset) {
  builder.addFieldOffset(1, niTimeOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<flatbuffers.Offset>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.ControllerDataLG.ALCs.createNiTimeVector = function(builder, data) {
  builder.startVector(4, data.length, 4);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.ControllerDataLG.ALCs.startNiTimeVector = function(builder, numElems) {
  builder.startVector(4, numElems, 4);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} alcSOffset
 */
Flatbuffer.ControllerDataLG.ALCs.addAlcS = function(builder, alcSOffset) {
  builder.addFieldOffset(2, alcSOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.ControllerDataLG.ALCs.startAlcSVector = function(builder, numElems) {
  builder.startVector(24, numElems, 4);
};

/**
 * @param {flatbuffers.Builder} builder
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.ControllerDataLG.ALCs.endALCs = function(builder) {
  var offset = builder.endObject();
  return offset;
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} offset
 */
Flatbuffer.ControllerDataLG.ALCs.finishALCsBuffer = function(builder, offset) {
  builder.finish(offset);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} offset
 */
Flatbuffer.ControllerDataLG.ALCs.finishSizePrefixedALCsBuffer = function(builder, offset) {
  builder.finish(offset, undefined, true);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} timeOffset
 * @param {flatbuffers.Offset} niTimeOffset
 * @param {flatbuffers.Offset} alcSOffset
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.ControllerDataLG.ALCs.createALCs = function(builder, timeOffset, niTimeOffset, alcSOffset) {
  Flatbuffer.ControllerDataLG.ALCs.startALCs(builder);
  Flatbuffer.ControllerDataLG.ALCs.addTime(builder, timeOffset);
  Flatbuffer.ControllerDataLG.ALCs.addNiTime(builder, niTimeOffset);
  Flatbuffer.ControllerDataLG.ALCs.addAlcS(builder, alcSOffset);
  return Flatbuffer.ControllerDataLG.ALCs.endALCs(builder);
}

// Exports for ECMAScript6 Modules
export {Flatbuffer};
