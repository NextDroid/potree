"use strict"
/**
 * @file This file is intended to help add event listeners for the data-labeling on the dropdown menu
 * Used by potree/src/viewer/PropertyPanels/PropertiesPanel.js
 */

// single point of truth for labels export (appended to doc by 'addLabelExport')
const labelExportId = "export-labels-container"

/**
 * @brief Helper function that to set up the volume and label event listeners on the side panel
 * @param {Viewer} viewer The passed viewer object
 * @note Have to use jQuery due to element being modified being created through jQuery ("this.elContent")
 * Element created in potree/src/viewer/PropertyPanels/VolumePanel.js
 */
export function addVolLabelListeners(viewer) {
    // add event listener for when new value selected in dropdown
    const dropdownId = "labelDropdown"
    const labelDropdown = $(`#${dropdownId}`)
    labelDropdown.change( () => {
        const sel = document.getElementById(dropdownId)
        const val = sel.value
        label(val, viewer)
        // only show label exports once first element is added
        $(`#${labelExportId}`).show()
    })

    // update metadata when input typed into
    const metadataId = "metadata-input"
    const elMetadata = document.getElementById(metadataId)
    elMetadata.addEventListener("change", (e) => {
        setMetadataInputText(elMetadata, e.target.value)
    })

    // add text, button, & event listeners for label exporting in sidebar
    addLabelExport()
}

function addLabelExport() {
    // if element already appended, do not duplicate
    if (document.getElementById(labelExportId)) {
        return
    }

    // create label export
    const geoJSONIcon = `${Potree.resourcePath}/icons/file_geojson.svg`
    const sceneExportContainer = $("#scene_export")
    const downloadLabelId = "download-label-btn"
    sceneExportContainer.append(`
        <div id="${labelExportId}" hidden>
            Labels: <br>
            <a href="#"><img id="${downloadLabelId}" src="${geoJSONIcon}" class="button-icon" style="height: 24px" /></a>
        </div>
    `)

    // download labels when "JSON" button is clicked
    $(`#${downloadLabelId}`).click(() => {
        const allMeasurements = getAllVolData()
        const outputJsonString = JSON.stringify(allMeasurements, null, 2)
        const timestamp = makeTimestampUTC()
        const filename = `${timestamp}_labels.json`
        console.log(`Saving label data to ${filename}`)
        // from potree/data-labeling/download.js
        download(outputJsonString, filename, 'text/plain')
    })
}

/**
 * @brief Helper function that labels based on input value
 * @param {Number} value The classification label based on the dropdown options
 * @param {Viewer} viewer The passed viewer object
 */
function label(value, viewer) {
    const currVolNode = getSelectedNode()
    if (currVolNode.text != "Volume") {
        window.alert("Select a Volume under 'Measurements' before labelling")
        return
    }

    // update info in .data portion of node (it already knows scale, position, and rotation)
    // WARN: any data saved outside of '.data' cannot be found when scanning tree with other methods
    currVolNode.data.t_valid_min = viewer.scene.pointclouds[0].material.uniforms.uFilterGPSTimeClipRange.value[0]
    currVolNode.data.t_valid_max = viewer.scene.pointclouds[0].material.uniforms.uFilterGPSTimeClipRange.value[1]
    currVolNode.data.timestamp = new Date().getTime()

    // add json key for label data before trying to add to it
    // (can't save to .data.label because it is already taken)
    if (currVolNode.data.labelData == null) currVolNode.data.labelData = {}
    currVolNode.data.labelData.label = value
}

/**
 * @returns {Array<getVolData()>} List of relevant data for each volume measurement
 */
function getAllVolData() {
    const measurementsRoot = $("#jstree_scene").jstree().get_json("measurements")
    return Array.from(measurementsRoot.children).map(child => getVolData(child))
        .filter(volume => volume.label != null)
}

/**
 * @brief Helper function to get the volume's information
 * @param {JSTree} node (optional) The desired JSTree node you want to get information from (default = selected node)
 * @returns {{
    *  t_valid_min: String
    *  t_valid_max: String
    *  timestamp: Number
    *  position: {
    *      "x": Number,
    *      "y": Number,
    *      "z": Number
    *  },
    *  rotation: {
    *      "_x": Number,
    *      "_y": Number,
    *      "_z": Number,
    *      "_order": String
    *  },
    *  size: {
    *      "x": Number,
    *      "y": Number,
    *      "z": Number
    *  }
    *  label: Number
    *  metadata: String
    * }} The relevant info of the selected volume
 */
export function getVolData(node=null) {
    const currVol = node == null ? getSelectedNode() : node
    const volData =  {
        t_valid_min:    currVol.data.t_valid_min,
        t_valid_max:    currVol.data.t_valid_max,
        timestamp:      currVol.data.timestamp,
        position:       currVol.data.position,
        rotation:       currVol.data.rotation,
        size:           currVol.data.scale,
        label:          currVol.data.labelData ? currVol.data.labelData.label : "",
        metadata:       currVol.data.labelData ? currVol.data.labelData.metadata : ""
    }
    return volData
}

/**
 * @brief Helper function to get data from measurements tree
 * @note return json is strange in that it does not appear to contain position, rotation, & size (but it does)
 */
function getSelectedNode() {
    return $("#jstree_scene").jstree("get_selected", true)[0]
}

function pad(number, len=2, char='0') {
    if (number < 0) {
        throw "negative numbers not supported yet"
    }
    const strNum = String(number)
    const numCharsNeeded = len-strNum.length
    return strNum + char.repeat(numCharsNeeded)
}

function makeTimestampUTC () {
    const date = new Date()
    // const obj = (date.getTime())
    const year = date.getFullYear()
    const month = date.getMonth()
    const day =  date.getDay()
    const hour =  date.getHours()
    const min = date.getMinutes()
    const sec = date.getSeconds()
    const timestamp = pad(year,4)+"-"+pad(month)+"-"+pad(day)+"T"+pad(hour)+":"+pad(min)+":"+pad(sec)
    return timestamp
}

/**
 * Set Select Box Selection By Text
 * @param {HTMLElement} dropEl Reference to the <select> tag element (cannot be jQuerry reference)
 * @param {String} value Element value
 */
export function setSelectBoxByValue(dropEl, value) {
    const target = Array.from(dropEl.options).filter(opt => opt.value == value)[0]
    target.selected = true
}

/**
 * @brief Helper function that updates the metadata element based on the current jstree node's data
 * @param {HTMLElement} elMetadata The input box element to update
 */
export function updateMetadataText(elMetadata) {
    const currNode = getSelectedNode()
    const nodeMetadata = currNode.data.labelData && currNode.data.labelData.metadata ?
        currNode.data.labelData.metadata : ""
    elMetadata.value = nodeMetadata
}

/**
 * @brief Helper function that sets the metadata in the jstree node & the actual input box html element
 * @param {HTMLElement} elMetadata The input box element
 * @param {String} newText The text to set to
 */
function setMetadataInputText(elMetadata, newText) {
    // set data in actual text box
    elMetadata.value = newText

    // save to jstree node storage
    const currNode = getSelectedNode()
    if (currNode.data.labelData == null) currNode.data.labelData = {}
    currNode.data.labelData.metadata = newText
}
