const fse = require('fs-extra');
const request = require('request');
const path = require('path');
const yauzl = require("yauzl");

const downloadUrl = "https://github.com/seiyria/gameicons-font/archive/master.zip";
const tempDir = "./temp";
const tempFilePath = tempDir + "/temp" + Date.now() + ".zip";
const cssFileName = "game-icons.css";
const eotFileName = "game-icons.eot";
const ttfFileName = "game-icons.ttf";
const woffFileName = "game-icons.woff";
const destDir = "./generator/fonts";

// ----------------------------------------------------------------------------
// Download
// ----------------------------------------------------------------------------
function downloadFile(url, dest) {
    console.log("  Downloading...");
    return new Promise((resolve, reject) => {
        request(url)
            .pipe(fse.createWriteStream(dest))
            .on("close", resolve)
            .on("error", reject);
    });
}

// ----------------------------------------------------------------------------
// Unzip
// ----------------------------------------------------------------------------
function unzipAll(src, dest) {
    console.log("  Unzipping...");
    return new Promise((resolve, reject) => {
        yauzl.open(src, {lazyEntries: true}, function(err, zipfile) {
            if (err) {
                reject(err);
                return;
            }
            zipfile.readEntry();
            zipfile.on("entry", function(entry) {
                if (/\/$/.test(entry.fileName)) {
                    // Directory file names end with '/'. Note that entries for
                    // directories themselves are optional. An entry's fileName
                    // implicitly requires its parent directories to exist.
                    zipfile.readEntry();
                } else {
                    var entryPath = path.parse(entry.fileName);
                    var fileName = entryPath.base;
                    var targetFile = path.join(dest, fileName);
                    var i = 2;
                    while (true) {
                        if (!fse.existsSync(targetFile)) {
                            break;
                        }
                        fileName = entryPath.name + "-" + i++ + entryPath.ext;
                        targetFile = path.join(dest, fileName);
                    }
                    zipfile.openReadStream(entry, function(err, readStream) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        readStream
                            .on("end", function() {
                                zipfile.readEntry();
                            }).pipe(
                                fse.createWriteStream(targetFile)
                                    .on("error", reject)
                            ).on("error", reject);
                    });
                }
            }).on("close", resolve);
        });
    });
}

// ----------------------------------------------------------------------------
// Copy
// ----------------------------------------------------------------------------
function cleanDirectory(src) {
    console.log("  Cleaning...");
    return new Promise((resolve, reject) => {
        fse.emptyDir(src, (err) => {
            if (err) { reject(); return; }
            resolve();
        });
    }); 
}

function moveFile(src, dst) {
    console.log("  Moving file...");
    return new Promise((resolve, reject) => {
        fse.move(src, dst, err => {
            if (err) reject(err);
            else resolve();
        });
    }); 
}

function removeFile(filePath) {
    console.log("  Removing file...");
    return new Promise(resolve => {
        fse.remove(filePath, err => {
            if (err) console.warn("Fonts: could not remove temporary file", err);
            resolve();
        });
    }); 
}

function copyAll(src, dest) {
    console.log("  Copying...");
    return new Promise((resolve, reject) => {
        fse.copy(src, dest, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

function moveAll(src, dest) {
    console.log("  Moving...");
    return new Promise((resolve, reject) => {
        fse.move(src, dest, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

function fixCss() {
    // fix gameicons-font issue https://github.com/seiyria/gameicons-font/issues/16
    return new Promise((resolve, reject) => {
        fse.readFile(destDir+"/"+cssFileName, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                let str = buffer.toString();
                const regex = /"\\([0-9a-fA-F]+)"/gm;
                let m, i = 0, fixNeeded = false;
                while ((m = regex.exec(str)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, groupIndex) => {
                        if (groupIndex !== 1) return;
                        if (i === 0 && match.length === 5) fixNeeded = true;
                        if (!fixNeeded) return;
                        const matchFixed = match.slice(0,1) + match.slice(2);
                        str = str.replace(`"\\${match}"`, `"\\${matchFixed}"`);
                    });
                    i++;
                }
                fse.writeFile(destDir+"/"+cssFileName, str, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                  });
            }
        })
    });
}

fse.emptyDir(tempDir)
    .then(() => console.log("Fonts: start"))
    .then(() => cleanDirectory(tempDir))
    .then(() => downloadFile(downloadUrl, tempFilePath))
    .then(() => unzipAll(tempFilePath, tempDir))
    .then(() => cleanDirectory(destDir))
    .then(() => moveFile(tempDir+"/"+cssFileName, destDir+"/"+cssFileName))
    .then(() => moveFile(tempDir+"/"+eotFileName, destDir+"/"+eotFileName))
    .then(() => moveFile(tempDir+"/"+ttfFileName, destDir+"/"+ttfFileName))
    .then(() => moveFile(tempDir+"/"+woffFileName, destDir+"/"+woffFileName))
    .then(() => fixCss())
    .then(() => cleanDirectory(tempDir).catch(err => {
        console.warn("Fonts: could not clean temporary directory", err);
    }))
    .then(() => console.log("Fonts: done"))
    .catch(err => {
        console.error("Fonts: error", err);
        process.exitCode = 1;
    });
