const { parentPort, workerData } = require('worker_threads');
var jsonpack = require("jsonpack")
var fs = require("fs")

fs.writeFileSync("./dbb.txt",jsonpack.pack(workerData))
fs.writeFileSync("./db.txt",jsonpack.pack(workerData))

parentPort.postMessage(true);
process.exit()