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
Flatbuffer.LIDAR = Flatbuffer.LIDAR || {};

/**
 * @constructor
 */
Flatbuffer.LIDAR.RtkPose = function() {
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
 * @returns {Flatbuffer.LIDAR.RtkPose}
 */
Flatbuffer.LIDAR.RtkPose.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.RtkPose.prototype.x = function() {
  return this.bb.readFloat64(this.bb_pos);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.RtkPose.prototype.mutate_x = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 0);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.RtkPose.prototype.y = function() {
  return this.bb.readFloat64(this.bb_pos + 8);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.RtkPose.prototype.mutate_y = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 8);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.RtkPose.prototype.z = function() {
  return this.bb.readFloat64(this.bb_pos + 16);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.RtkPose.prototype.mutate_z = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 16);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.RtkPose.prototype.roll = function() {
  return this.bb.readFloat64(this.bb_pos + 24);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.RtkPose.prototype.mutate_roll = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 24);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.RtkPose.prototype.pitch = function() {
  return this.bb.readFloat64(this.bb_pos + 32);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.RtkPose.prototype.mutate_pitch = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 32);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.RtkPose.prototype.yaw = function() {
  return this.bb.readFloat64(this.bb_pos + 40);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.RtkPose.prototype.mutate_yaw = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 40);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} roll
 * @param {number} pitch
 * @param {number} yaw
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.LIDAR.RtkPose.createRtkPose = function(builder, x, y, z, roll, pitch, yaw) {
  builder.prep(8, 48);
  builder.writeFloat64(yaw);
  builder.writeFloat64(pitch);
  builder.writeFloat64(roll);
  builder.writeFloat64(z);
  builder.writeFloat64(y);
  builder.writeFloat64(x);
  return builder.offset();
};

/**
 * @constructor
 */
Flatbuffer.LIDAR.Point = function() {
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
 * @returns {Flatbuffer.LIDAR.Point}
 */
Flatbuffer.LIDAR.Point.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.Point.prototype.x = function() {
  return this.bb.readFloat64(this.bb_pos);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.Point.prototype.mutate_x = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 0);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.Point.prototype.y = function() {
  return this.bb.readFloat64(this.bb_pos + 8);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.Point.prototype.mutate_y = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 8);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.Point.prototype.z = function() {
  return this.bb.readFloat64(this.bb_pos + 16);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.Point.prototype.mutate_z = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 16);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.Point.prototype.intensity = function() {
  return this.bb.readUint8(this.bb_pos + 24);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.Point.prototype.mutate_intensity = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 24);

  if (offset === 0) {
    return false;
  }

  this.bb.writeUint8(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.Point.prototype.timestamp = function() {
  return this.bb.readFloat64(this.bb_pos + 32);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.Point.prototype.mutate_timestamp = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 32);

  if (offset === 0) {
    return false;
  }

  this.bb.writeFloat64(this.bb_pos + offset, value);
  return true;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.Point.prototype.beamID = function() {
  return this.bb.readUint8(this.bb_pos + 40);
};

/**
 * @param {number} value
 * @returns {boolean}
 */
Flatbuffer.LIDAR.Point.prototype.mutate_beamID = function(value) {
  var offset = this.bb.__offset(this.bb_pos, 40);

  if (offset === 0) {
    return false;
  }

  this.bb.writeUint8(this.bb_pos + offset, value);
  return true;
};

/**
 * @param {Flatbuffer.LIDAR.RtkPose=} obj
 * @returns {Flatbuffer.LIDAR.RtkPose|null}
 */
Flatbuffer.LIDAR.Point.prototype.rtkPose = function(obj) {
  return (obj || new Flatbuffer.LIDAR.RtkPose).__init(this.bb_pos + 48, this.bb);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} intensity
 * @param {number} timestamp
 * @param {number} beamID
 * @param {number} rtkPose_x
 * @param {number} rtkPose_y
 * @param {number} rtkPose_z
 * @param {number} rtkPose_roll
 * @param {number} rtkPose_pitch
 * @param {number} rtkPose_yaw
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.LIDAR.Point.createPoint = function(builder, x, y, z, intensity, timestamp, beamID, rtkPose_x, rtkPose_y, rtkPose_z, rtkPose_roll, rtkPose_pitch, rtkPose_yaw) {
  builder.prep(8, 96);
  builder.prep(8, 48);
  builder.writeFloat64(rtkPose_yaw);
  builder.writeFloat64(rtkPose_pitch);
  builder.writeFloat64(rtkPose_roll);
  builder.writeFloat64(rtkPose_z);
  builder.writeFloat64(rtkPose_y);
  builder.writeFloat64(rtkPose_x);
  builder.pad(7);
  builder.writeInt8(beamID);
  builder.writeFloat64(timestamp);
  builder.pad(7);
  builder.writeInt8(intensity);
  builder.writeFloat64(z);
  builder.writeFloat64(y);
  builder.writeFloat64(x);
  return builder.offset();
};

/**
 * @constructor
 */
Flatbuffer.LIDAR.PointCloud = function() {
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
 * @returns {Flatbuffer.LIDAR.PointCloud}
 */
Flatbuffer.LIDAR.PointCloud.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @param {flatbuffers.ByteBuffer} bb
 * @param {Flatbuffer.LIDAR.PointCloud=} obj
 * @returns {Flatbuffer.LIDAR.PointCloud}
 */
Flatbuffer.LIDAR.PointCloud.getRootAsPointCloud = function(bb, obj) {
  return (obj || new Flatbuffer.LIDAR.PointCloud).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @param {number} index
 * @param {Flatbuffer.LIDAR.Point=} obj
 * @returns {Flatbuffer.LIDAR.Point}
 */
Flatbuffer.LIDAR.PointCloud.prototype.points = function(index, obj) {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? (obj || new Flatbuffer.LIDAR.Point).__init(this.bb.__vector(this.bb_pos + offset) + index * 96, this.bb) : null;
};

/**
 * @returns {number}
 */
Flatbuffer.LIDAR.PointCloud.prototype.pointsLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @param {flatbuffers.Builder} builder
 */
Flatbuffer.LIDAR.PointCloud.startPointCloud = function(builder) {
  builder.startObject(1);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} pointsOffset
 */
Flatbuffer.LIDAR.PointCloud.addPoints = function(builder, pointsOffset) {
  builder.addFieldOffset(0, pointsOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.LIDAR.PointCloud.startPointsVector = function(builder, numElems) {
  builder.startVector(96, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.LIDAR.PointCloud.endPointCloud = function(builder) {
  var offset = builder.endObject();
  return offset;
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} offset
 */
Flatbuffer.LIDAR.PointCloud.finishPointCloudBuffer = function(builder, offset) {
  builder.finish(offset);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} pointsOffset
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.LIDAR.PointCloud.createPointCloud = function(builder, pointsOffset) {
  Flatbuffer.LIDAR.PointCloud.startPointCloud(builder);
  Flatbuffer.LIDAR.PointCloud.addPoints(builder, pointsOffset);
  return Flatbuffer.LIDAR.PointCloud.endPointCloud(builder);
}

// Exports for ECMAScript6 Modules
export {Flatbuffer};
