//import { Vec3 } from "../schemas/BasicTypes_generated.js";
//import { Flatbuffer } from "../schemas/VisualizationPrimitives_generated.js";


export function loadGaps(s3, bucket, name, shaderMaterial, animationEngine, callback) {
  const tstart = performance.now();
  if (s3 && bucket && name) {
    (async () => {
      const objectName = `${name}/2_Truth/gaps.fb`;
      const schemaFile = `${name}/5_Schemas/VisualizationPrimitives_generated.js`;

      const schemaUrl = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: schemaFile
      });

      s3.getObject({Bucket: bucket,
                    Key: objectName},
                   async (err, data) => {
                     if (err) {
                       console.log(err, err.stack);
                     } else {
                       const FlatbufferModule = await import(schemaUrl);
                       const gapGeometries = parseGaps(data.Body, shaderMaterial, FlatbufferModule, animationEngine);
                       console.log("Full Runtime: "+(performance.now()-tstart)+"ms");
                       callback( gapGeometries );
                     }});
    })();

  } else {
    const filename = "../data/gaps.fb";
    const schemaFile = "../schemas/VisualizationPrimitives_generated.js";
    let t0, t1;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", filename);
    xhr.responseType = "arraybuffer";

    xhr.onprogress = function(event) {
      t1 = performance.now();
      console.log("Loaded ["+event.loaded+"] bytes in ["+(t1-t0)+"] ms")
      t0 = t1;
    }

    xhr.onload = async function(data) {

      const FlatbufferModule = await import(schemaFile);

      const response = data.target.response;
      if (!response) {
        console.error("Could not create buffer from gap data");
        return;
      }

      let bytesArray = new Uint8Array(response);
      const gapGeometries = parseGaps(bytesArray, shaderMaterial, FlatbufferModule, animationEngine);
      console.log("Full Runtime: "+(performance.now()-tstart)+"ms");
      callback( gapGeometries );
    };

    t0 = performance.now();
    xhr.send();
  }
}


function parseGaps(bytesArray, shaderMaterial, FlatbufferModule, animationEngine) {

  let numBytes = bytesArray.length;
  let gaps = [];

  let segOffset = 0;
  let segSize, viewSize, viewData;
  while (segOffset < numBytes) {

    // Read SegmentSize:
    viewSize = new DataView(bytesArray.buffer, segOffset, 4);
    segSize = viewSize.getUint32(0, true); // True: little-endian | False: big-endian

    // Get Flatbuffer Gap Object:
    segOffset += 4;
    let buf = new Uint8Array(bytesArray.buffer.slice(segOffset, segOffset+segSize));
    let fbuffer = new flatbuffers.ByteBuffer(buf);
    let gap = FlatbufferModule.Flatbuffer.Primitives.PolyLine3D.getRootAsPolyLine3D(fbuffer);

    gaps.push(gap);
    segOffset += segSize;
  }
  return createGapGeometriesOld(gaps, shaderMaterial, FlatbufferModule, animationEngine);
}

function splitGapVertices(gaps) {
  debugger;

  let gapVertices = [];
  let gapLength, vtx, gapPoints;
  for (let ii=0, gapLength=gaps.length; ii<gapLength; ii++) {
    gap = gaps[ii];

    gapVertices = [];
    for (let jj=0, numGapVtx=gap.gapLength; jj<numGapVtx; jj++) {
      vtx = gap.vertices(jj);
      gapVertices.push( new THREE.Vector3(vtx.x(), vtx.y(), vtx.z()) );
    }
    gapVertices.push(gapVertices);


  }

  let output = {
      gapGroups: gapVertices,
  }

  return output;
}

function createGapGeometries(vertexGroups, material) {
  debugger;
  let gapGeometries = [];
  let allBoxes = new THREE.Geometry();

  let vertexGroup;
  let v1, v2;
  let length, width, height;
  let vector, axis;
  let center, firstCenter, delta;
  let boxGeometry, se3, quaternion;
  debugger; // vertexGroups.length
  for (let ii=0, len=vertexGroups.length; ii<len; ii++) {

    vertexGroup = vertexGroups[ii];

    for (let jj=1, numVertices=vertexGroup.length; jj<numVertices; jj++) {

      v1 = vertexGroup[jj-1];
      v2 = vertexGroup[jj];

      length = v1.distanceTo(v2);
      height = 0.01;
      width = 0.1;

      vector = v2.sub(v1);
      axis = new THREE.Vector3(1, 0, 0);
      center = v1.addScaledVector(vector, 0.5);

      if (firstCenter == undefined) {
        firstCenter = center.clone();
      }

      delta = center.clone().sub(firstCenter);
      lastCenter = center.clone();
      // debugger; // delta

      // Transform Box:
      boxGeometry = new THREE.BoxGeometry(length, width, height);
      se3 = new THREE.Matrix4();
      quaternion = new THREE.Quaternion().setFromUnitVectors(axis, vector.clone().normalize());
      // debugger; // se3;
      se3.makeRotationFromQuaternion(quaternion); // Rotation
      se3.setPosition(delta); // Translation

      boxGeometry.applyMatrix( se3 );
      allBoxes.merge(boxGeometry);

      if ((ii%10000)==0 || ii==(len-1)) {
        // let mesh = new THREE.Mesh(allBoxes, new THREE.MeshBasicMaterial({color:0x00ff00}));
        let mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(allBoxes), material); // Buffergeometry
        mesh.position.copy(firstCenter);
        gapGeometries.push(mesh);
        allBoxes = new THREE.Geometry();
        firstCenter = center.clone();
      }


    }
  }

  return gapGeometries;
}


function createGapGeometriesOld(gaps, shaderMaterial, FlatbufferModule, animationEngine) {

  let gap;
  let lefts = [];

  let all = [];
  let allBoxes = new THREE.Geometry();
  let gapTimes = [];
  for(let ii=0, len=gaps.length; ii<len; ii++) {
    gap = gaps[ii];

    var geometryLeft = new THREE.Geometry();  // TODO this is just a temporary variable to get an array of vertices later, do this in a better way

    let left;
    for(let jj=0, numVertices=gap.verticesLength(); jj<numVertices; jj++) {
      left = gap.vertices(jj);
      geometryLeft.vertices.push( new THREE.Vector3(left.x(), left.y(), left.z()));
    }


    // NOTE TRYING BOXES:
    let tmp1, tmp2, p1, p2, v1, v2;
    let firstCenter, center, lastCenter;
    let vertices = geometryLeft.vertices;
    let offset = new THREE.Vector3(300043.226, 4701247.907, 245.427); // TODO FIX THIS HARDCODED OFFSET (it's just a large number to bring the vertices below close to 0)

    createBoxes(geometryLeft.vertices, shaderMaterial);

    function createBoxes(vertices, material) {
      for (let ii=1, len=vertices.length; ii<len; ii++) {
        tmp1 = vertices[ii-1];
        tmp2 = vertices[ii];

        p1 = new THREE.Vector3(tmp1.x, tmp1.y, tmp1.z);
        p2 = new THREE.Vector3(tmp2.x, tmp2.y, tmp2.z);

        let length = p1.distanceTo(p2);
        let width = gap.widthForVisualization();
        let height = 0.01;

        let vector = p2.sub(p1);
        let axis = new THREE.Vector3(1, 0, 0);
        center = p1.addScaledVector(vector, 0.5);
        let centerNoOffset = new THREE.Vector3(center.x, center.y, center.z).sub(offset);
        if (lastCenter == undefined) {
          lastCenter = center.clone();
          firstCenter = center.clone();
        }
        // debugger; // lastCenter.sub(center) or center.sub(lastCenter);
        // let delta = lastCenter.clone().sub(center);
        // let delta = center.clone().sub(lastCenter);
        let delta = center.clone().sub(firstCenter);
        lastCenter = center.clone();
        // debugger; // delta
        let geometry = new THREE.BoxGeometry(length, width, height);

        // for allBoxes:
        let boxGeometry = new THREE.BoxGeometry(length, width, height);
        let se3 = new THREE.Matrix4();
        let quaternion = new THREE.Quaternion().setFromUnitVectors(axis, vector.clone().normalize()); // TODO NOTE: This aligns the yaw but also applies a roll/pitch as well
        // debugger; // se3;
        se3.makeRotationFromQuaternion(quaternion); // Rotation
        se3.setPosition(delta); // Translation

        boxGeometry.applyMatrix( se3 );
        // TODO rotate boxGeometry.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
        allBoxes.merge(boxGeometry);


        let boxMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});

        let boxMesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(geometry), boxMaterial);


        boxMesh.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
        // boxMesh.geometry.translate(centerNoOffset.x, centerNoOffset.y, centerNoOffset.z);
        // boxMesh.position.copy(offset.clone());
        boxMesh.position.copy(center.clone());

        lefts.push(boxMesh);
        gapTimes.push(
          gap.viz(new FlatbufferModule.Flatbuffer.Primitives.HideAndShowAnimation())
             .timestamp(new FlatbufferModule.Flatbuffer.Primitives.ObjectTimestamp())
             .value() - animationEngine.tstart
        );

        if ((ii%100000)==0 || ii==(len-1)) {
          // let mesh = new THREE.Mesh(allBoxes, new THREE.MeshBasicMaterial({color:0x00ff00}));
          let mesh = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(allBoxes), material); // Buffergeometry
          mesh.name = "Gaps";
          mesh.position.copy(firstCenter);
          let timestamps = [];
          for (let tt=0, numTimes=gapTimes.length; tt<numTimes; tt++) {
            for (let kk=0, numVerticesPerBox=36; kk<numVerticesPerBox; kk++) {  // NOTE: 24 vertices per edgesBox
              timestamps.push(gapTimes[tt]);
            }
          }
          mesh.geometry.addAttribute('gpsTime', new THREE.Float32BufferAttribute(timestamps, 1));

          all.push(mesh);
          allBoxes = new THREE.Geometry();
          firstCenter = center.clone();
          gapTimes = [];
        }
      }
    }
  }

  const output = {
    left: all
  }
  return output;
}
