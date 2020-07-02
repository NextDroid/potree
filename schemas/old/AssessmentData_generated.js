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
Flatbuffer.AssessmentData = Flatbuffer.AssessmentData || {};

/**
 * @constructor
 */
Flatbuffer.AssessmentData.AssessmentData = function() {
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
 * @returns {Flatbuffer.AssessmentData.AssessmentData}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.__init = function(i, bb) {
  this.bb_pos = i;
  this.bb = bb;
  return this;
};

/**
 * @param {flatbuffers.ByteBuffer} bb
 * @param {Flatbuffer.AssessmentData.AssessmentData=} obj
 * @returns {Flatbuffer.AssessmentData.AssessmentData}
 */
Flatbuffer.AssessmentData.AssessmentData.getRootAsAssessmentData = function(bb, obj) {
  return (obj || new Flatbuffer.AssessmentData.AssessmentData).__init(bb.readInt32(bb.position()) + bb.position(), bb);
};

/**
 * @param {flatbuffers.Encoding=} optionalEncoding
 * @returns {string|Uint8Array|null}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.supplier = function(optionalEncoding) {
  var offset = this.bb.__offset(this.bb_pos, 4);
  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
};

/**
 * @param {flatbuffers.Encoding=} optionalEncoding
 * @returns {string|Uint8Array|null}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.laneId = function(optionalEncoding) {
  var offset = this.bb.__offset(this.bb_pos, 6);
  return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.latitude = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 8);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.latitudeLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 8);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.latitudeArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 8);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.longitude = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 10);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.longitudeLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 10);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.longitudeArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 10);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.curvatureUnlocalized = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 12);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.curvatureUnlocalizedLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 12);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.curvatureUnlocalizedArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 12);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.curvatureLocalized = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 14);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.curvatureLocalizedLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 14);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.curvatureLocalizedArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 14);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReference = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 16);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 16);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 16);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceFromStart = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 18);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceFromStartLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 18);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceFromStartArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 18);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.translation60m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 20);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.translation60mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 20);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.translation60mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 20);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.rotation60m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 22);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.rotation60mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 22);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.rotation60mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 22);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceUnlocalized60m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 24);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceUnlocalized60mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 24);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceUnlocalized60mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 24);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLocalized60m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 26);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLocalized60mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 26);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLocalized60mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 26);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.translation150m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 28);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.translation150mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 28);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.translation150mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 28);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.rotation150m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 30);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.rotation150mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 30);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.rotation150mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 30);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceUnlocalized150m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 32);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceUnlocalized150mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 32);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceUnlocalized150mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 32);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {number} index
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLocalized150m = function(index) {
  var offset = this.bb.__offset(this.bb_pos, 34);
  return offset ? this.bb.readFloat64(this.bb.__vector(this.bb_pos + offset) + index * 8) : 0;
};

/**
 * @returns {number}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLocalized150mLength = function() {
  var offset = this.bb.__offset(this.bb_pos, 34);
  return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
};

/**
 * @returns {Float64Array}
 */
Flatbuffer.AssessmentData.AssessmentData.prototype.distanceToReferenceLocalized150mArray = function() {
  var offset = this.bb.__offset(this.bb_pos, 34);
  return offset ? new Float64Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
};

/**
 * @param {flatbuffers.Builder} builder
 */
Flatbuffer.AssessmentData.AssessmentData.startAssessmentData = function(builder) {
  builder.startObject(16);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} supplierOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addSupplier = function(builder, supplierOffset) {
  builder.addFieldOffset(0, supplierOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} laneIdOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addLaneId = function(builder, laneIdOffset) {
  builder.addFieldOffset(1, laneIdOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} latitudeOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addLatitude = function(builder, latitudeOffset) {
  builder.addFieldOffset(2, latitudeOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createLatitudeVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startLatitudeVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} longitudeOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addLongitude = function(builder, longitudeOffset) {
  builder.addFieldOffset(3, longitudeOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createLongitudeVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startLongitudeVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} curvatureUnlocalizedOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addCurvatureUnlocalized = function(builder, curvatureUnlocalizedOffset) {
  builder.addFieldOffset(4, curvatureUnlocalizedOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createCurvatureUnlocalizedVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startCurvatureUnlocalizedVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} curvatureLocalizedOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addCurvatureLocalized = function(builder, curvatureLocalizedOffset) {
  builder.addFieldOffset(5, curvatureLocalizedOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createCurvatureLocalizedVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startCurvatureLocalizedVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} distanceToReferenceOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addDistanceToReference = function(builder, distanceToReferenceOffset) {
  builder.addFieldOffset(6, distanceToReferenceOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createDistanceToReferenceVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startDistanceToReferenceVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} distanceFromStartOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addDistanceFromStart = function(builder, distanceFromStartOffset) {
  builder.addFieldOffset(7, distanceFromStartOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createDistanceFromStartVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startDistanceFromStartVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} translation60mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addTranslation60m = function(builder, translation60mOffset) {
  builder.addFieldOffset(8, translation60mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createTranslation60mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startTranslation60mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} rotation60mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addRotation60m = function(builder, rotation60mOffset) {
  builder.addFieldOffset(9, rotation60mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createRotation60mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startRotation60mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} distanceToReferenceUnlocalized60mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceUnlocalized60m = function(builder, distanceToReferenceUnlocalized60mOffset) {
  builder.addFieldOffset(10, distanceToReferenceUnlocalized60mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createDistanceToReferenceUnlocalized60mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startDistanceToReferenceUnlocalized60mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} distanceToReferenceLocalized60mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceLocalized60m = function(builder, distanceToReferenceLocalized60mOffset) {
  builder.addFieldOffset(11, distanceToReferenceLocalized60mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createDistanceToReferenceLocalized60mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startDistanceToReferenceLocalized60mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} translation150mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addTranslation150m = function(builder, translation150mOffset) {
  builder.addFieldOffset(12, translation150mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createTranslation150mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startTranslation150mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} rotation150mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addRotation150m = function(builder, rotation150mOffset) {
  builder.addFieldOffset(13, rotation150mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createRotation150mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startRotation150mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} distanceToReferenceUnlocalized150mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceUnlocalized150m = function(builder, distanceToReferenceUnlocalized150mOffset) {
  builder.addFieldOffset(14, distanceToReferenceUnlocalized150mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createDistanceToReferenceUnlocalized150mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startDistanceToReferenceUnlocalized150mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} distanceToReferenceLocalized150mOffset
 */
Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceLocalized150m = function(builder, distanceToReferenceLocalized150mOffset) {
  builder.addFieldOffset(15, distanceToReferenceLocalized150mOffset, 0);
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {Array.<number>} data
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createDistanceToReferenceLocalized150mVector = function(builder, data) {
  builder.startVector(8, data.length, 8);
  for (var i = data.length - 1; i >= 0; i--) {
    builder.addFloat64(data[i]);
  }
  return builder.endVector();
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {number} numElems
 */
Flatbuffer.AssessmentData.AssessmentData.startDistanceToReferenceLocalized150mVector = function(builder, numElems) {
  builder.startVector(8, numElems, 8);
};

/**
 * @param {flatbuffers.Builder} builder
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.endAssessmentData = function(builder) {
  var offset = builder.endObject();
  return offset;
};

/**
 * @param {flatbuffers.Builder} builder
 * @param {flatbuffers.Offset} supplierOffset
 * @param {flatbuffers.Offset} laneIdOffset
 * @param {flatbuffers.Offset} latitudeOffset
 * @param {flatbuffers.Offset} longitudeOffset
 * @param {flatbuffers.Offset} curvatureUnlocalizedOffset
 * @param {flatbuffers.Offset} curvatureLocalizedOffset
 * @param {flatbuffers.Offset} distanceToReferenceOffset
 * @param {flatbuffers.Offset} distanceFromStartOffset
 * @param {flatbuffers.Offset} translation60mOffset
 * @param {flatbuffers.Offset} rotation60mOffset
 * @param {flatbuffers.Offset} distanceToReferenceUnlocalized60mOffset
 * @param {flatbuffers.Offset} distanceToReferenceLocalized60mOffset
 * @param {flatbuffers.Offset} translation150mOffset
 * @param {flatbuffers.Offset} rotation150mOffset
 * @param {flatbuffers.Offset} distanceToReferenceUnlocalized150mOffset
 * @param {flatbuffers.Offset} distanceToReferenceLocalized150mOffset
 * @returns {flatbuffers.Offset}
 */
Flatbuffer.AssessmentData.AssessmentData.createAssessmentData = function(builder, supplierOffset, laneIdOffset, latitudeOffset, longitudeOffset, curvatureUnlocalizedOffset, curvatureLocalizedOffset, distanceToReferenceOffset, distanceFromStartOffset, translation60mOffset, rotation60mOffset, distanceToReferenceUnlocalized60mOffset, distanceToReferenceLocalized60mOffset, translation150mOffset, rotation150mOffset, distanceToReferenceUnlocalized150mOffset, distanceToReferenceLocalized150mOffset) {
  Flatbuffer.AssessmentData.AssessmentData.startAssessmentData(builder);
  Flatbuffer.AssessmentData.AssessmentData.addSupplier(builder, supplierOffset);
  Flatbuffer.AssessmentData.AssessmentData.addLaneId(builder, laneIdOffset);
  Flatbuffer.AssessmentData.AssessmentData.addLatitude(builder, latitudeOffset);
  Flatbuffer.AssessmentData.AssessmentData.addLongitude(builder, longitudeOffset);
  Flatbuffer.AssessmentData.AssessmentData.addCurvatureUnlocalized(builder, curvatureUnlocalizedOffset);
  Flatbuffer.AssessmentData.AssessmentData.addCurvatureLocalized(builder, curvatureLocalizedOffset);
  Flatbuffer.AssessmentData.AssessmentData.addDistanceToReference(builder, distanceToReferenceOffset);
  Flatbuffer.AssessmentData.AssessmentData.addDistanceFromStart(builder, distanceFromStartOffset);
  Flatbuffer.AssessmentData.AssessmentData.addTranslation60m(builder, translation60mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addRotation60m(builder, rotation60mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceUnlocalized60m(builder, distanceToReferenceUnlocalized60mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceLocalized60m(builder, distanceToReferenceLocalized60mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addTranslation150m(builder, translation150mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addRotation150m(builder, rotation150mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceUnlocalized150m(builder, distanceToReferenceUnlocalized150mOffset);
  Flatbuffer.AssessmentData.AssessmentData.addDistanceToReferenceLocalized150m(builder, distanceToReferenceLocalized150mOffset);
  return Flatbuffer.AssessmentData.AssessmentData.endAssessmentData(builder);
}

// Exports for ECMAScript6 Modules
export {Flatbuffer};
