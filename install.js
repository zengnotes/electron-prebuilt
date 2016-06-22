#!/usr/bin/env node
var fs = require('fs')
var os = require('os')
var path = require('path')
var extract = require('extract-zip')
var download = require('electron-download')

var version = process.env.ELECTRON_VERSION ||
  process.env.npm_config_electron_version

if (!version) throw new Error('must specify version')

var productName = process.env.ELECTRON_PRODUCT_NAME ||
    process.env.npm_config_electron_product_name ||
    'Electron'

var platform = os.platform()

var installedVersion = null
try {
  installedVersion = fs.readFileSync(path.join(__dirname, 'dist', 'version'), 'utf-8').replace(/^v/, '')
} catch (err) {
  // do nothing
}

function onerror (err) {
  throw err
}

var paths = {
  darwin: 'dist/' + productName + '.app/Contents/MacOS/' + productName,
  freebsd: 'dist' + productName.toLowerCase(),
  linux: 'dist/' + productName.toLowerCase(),
  win32: 'dist/' + productName.toLowerCase() + '.exe'
}

if (installedVersion === version && fs.existsSync(path.join(__dirname, paths[platform]))) {
  process.exit(0)
}

// downloads if not cached
download({version, platform}, extractFile)

// unzips and makes path.txt point at the correct executable
function extractFile (err, zipPath) {
  if (err) return onerror(err)
  fs.writeFile(path.join(__dirname, 'path.txt'), paths[platform], function (err) {
    if (err) return onerror(err)
    extract(zipPath, {dir: path.join(__dirname, 'dist')}, function (err) {
      if (err) return onerror(err)
    })
  })
}
