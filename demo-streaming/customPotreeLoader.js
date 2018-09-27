function loadIntoPotree(geometry) {

  let pco = new PointCloudOctreeGeometry();

  // TODO: Set various attributes
  // pco.spacing =
  // pco.heirarchyStepSize =
  // pco.pointAttributes = fMno.pointAttributes;
  //
  // let min = new THREE.Vector3(fMno.boundingBox.lx, fMno.boundingBox.ly, fMno.boundingBox.lz);
  // let max = new THREE.Vector3(fMno.boundingBox.ux, fMno.boundingBox.uy, fMno.boundingBox.uz);
  // let boundingBox = new THREE.Box3(min, max);
  // let tightBoundingBox = boundingBox.clone();
  //
  // if (fMno.tightBoundingBox) {
  //   tightBoundingBox.min.copy(new THREE.Vector3(fMno.tightBoundingBox.lx, fMno.tightBoundingBox.ly, fMno.tightBoundingBox.lz));
  //   tightBoundingBox.max.copy(new THREE.Vector3(fMno.tightBoundingBox.ux, fMno.tightBoundingBox.uy, fMno.tightBoundingBox.uz));
  // }
  //
  // let offset = min.clone();
  //
  // boundingBox.min.sub(offset);
  // boundingBox.max.sub(offset);
  //
  // tightBoundingBox.min.sub(offset);
  // tightBoundingBox.max.sub(offset);
  //
  // pco.projection = fMno.projection;
  // pco.boundingBox = boundingBox;
  // pco.tightBoundingBox = tightBoundingBox;
  // pco.boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
  // pco.tightBoundingSphere = tightBoundingBox.getBoundingSphere(new THREE.Sphere());
  // pco.offset = offset;
  // if (fMno.pointAttributes === 'LAS') {
  //   pco.loader = new LasLazLoader(fMno.version);
  // } else if (fMno.pointAttributes === 'LAZ') {
  //   pco.loader = new LasLazLoader(fMno.version);
  // } else {
  //   pco.loader = new BinaryLoader(fMno.version, boundingBox, fMno.scale);
  //   pco.pointAttributes = new PointAttributes(pco.pointAttributes);
  // }
  //
  let nodes = {};

  { // load root
    let name = 'r';

    let root = new PointCloudOctreeGeometryNode(name, pco, boundingBox);
    root.level = 0;
    root.hasChildren = true;
    root.spacing = pco.spacing;
    if (version.upTo('1.5')) {
      root.numPoints = fMno.hierarchy[0][1];
    } else {
      root.numPoints = 0;
    }
    pco.root = root;
    pco.root.load();
    nodes[name] = root;
  }

  callback(pco);
}
