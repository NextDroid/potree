
# README

* [Getting Started](./docs/getting_started.md)

## Instructions for Running Local Demo
### 1. Install Dependencies
Make sure you have [node.js](http://nodejs.org/) installed

Install all dependencies, as specified in package.json,
then, install the gulp build tool:

    cd <potree_directory>
    npm install --save
    npm install -g gulp
    npm install -g rollup

### 2. Symlink to Local Pointcloud
This local demo is hardcoded to search for a pointcloud at: `<potree_directory>/pointclouds/test/cloud.js`

To setup the demo pointcloud, create a symlink (on a UNIX-based system) to this local cloud as follows:
```
ln -s /path/to/local/cloud <potree_directory>/pointclouds/test
```
Note: Directly copying the pointcloud directory to this location works as well.

### 3. Symlink the Required Data Files:
The local demo also looks for several data files to exist in the directory `<potree_directory>/data`:

#### A) Rtk CSV File:
The `rtk.csv` is __required__ and must exist in the `<potree_directory>/data` folder.

#### B) Additional Data Files:
Additional files that can be included in the data directory are:
 - `lanes.fb`
 - `tracks.fb`
 - `detections.fb`

Like the `rtk.csv` file these can be symlinked or copied directly. Note that these flatbuffer (.fb) files require the schemas in the directory `<potree_directory>/schemas` in order to be parsed. If your data is not rendering correctly in potree, then you should ensure that the schemas used to generate your flatbuffers match the ones in the schemas directory.

### 4. Run the Potree Server
Running the ```gulp watch``` command will "compile" the potree code and start a web server at localhost:1234.

Go to http://localhost:1234/demo/radar.html/ to see your dataset visualized (this can also be done by using the `VeritasApplication` webapp)

```
gulp watch
```

## About

Potree is a free open-source WebGL based point cloud renderer for large point clouds.
It is based on the [TU Wien Scanopy project](https://www.cg.tuwien.ac.at/research/projects/Scanopy/)
and it was part of the [Harvest4D Project](https://harvest4d.org/).


<a href="http://potree.org/wp/demo/" target="_blank"> ![](./docs/images/potree_screens.png) </a>

Newest information and work in progress is usually available on [twitter](https://twitter.com/m_schuetz)

Contact: Markus Schütz (mschuetz@potree.org)

Reference: [Potree: Rendering Large Point Clouds in Web Browsers](https://www.cg.tuwien.ac.at/research/publications/2016/SCHUETZ-2016-POT/SCHUETZ-2016-POT-thesis.pdf)

## Build

Make sure you have [node.js](http://nodejs.org/) installed

Install all dependencies, as specified in package.json,
then, install the gulp build tool:

    cd <potree_directory>
    npm install --save
    npm install -g gulp
    npm install -g rollup

Use the ```gulp watch``` command to

* create ./build/potree
* watch for changes to the source code and automatically create a new build on change
* start a web server at localhost:1234. Go to http://localhost:1234/examples/ to test the examples.

```
gulp watch
```

## Downloads

[PotreeConverter source and Win64 binaries](https://github.com/potree/PotreeConverter/releases)

## Showcase

Take a look at the [potree showcase](http://potree.org/wp/demo/) for some live examples.

## Compatibility

| Browser              | OS      | Result        |   |
| -------------------- |:-------:|:-------------:|:-:|
| Chrome 64            | Win10   | works         |   |
| Firefox 58           | Win10   | works         |   |
| Edge                 | Win10   | not supported |   |
| Internet Explorer 11 | Win7    | not supported |   |
| Chrome               | Android | works         | Reduced functionality due to unsupported WebGL extensions |
| Opera                | Android | works         | Reduced functionality due to unsupported WebGL extensions |

## Credits

* The multi-res-octree algorithms used by this viewer were developed at the Vienna University of Technology by Michael Wimmer and Claus Scheiblauer as part of the [Scanopy Project](http://www.cg.tuwien.ac.at/research/projects/Scanopy/).
* [Three.js](https://github.com/mrdoob/three.js), the WebGL 3D rendering library on which potree is built.
* [plas.io](http://plas.io/) point cloud viewer. LAS and LAZ support have been taken from the laslaz.js implementation of plas.io. Thanks to [Uday Verma](https://twitter.com/udaykverma) and [Howard Butler](https://twitter.com/howardbutler) for this!
* [Harvest4D](https://harvest4d.org/) Potree currently runs as Master Thesis under the Harvest4D Project
* Christian Boucheny (EDL developer) and Daniel Girardeau-Montaut ([CloudCompare](http://www.danielgm.net/cc/)). The EDL shader was adapted from the CloudCompare source code!
* [Martin Isenburg](http://rapidlasso.com/), [Georepublic](http://georepublic.de/en/),
[Veesus](http://veesus.com/), [Sigeom Sa](http://www.sigeom.ch/), [SITN](http://www.ne.ch/sitn), [LBI ArchPro](http://archpro.lbg.ac.at/),  [Pix4D](http://pix4d.com/) as well as all the contributers to potree and PotreeConverter and many more for their support.
