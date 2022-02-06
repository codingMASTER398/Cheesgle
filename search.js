const {performance} = require('perf_hooks');
const time1 = performance.now();

const { parentPort, workerData } = require('worker_threads');
const Fuse = require('fuse.js')

function chunk (arr, len) { // Chunk function from stackoverflow

  var chunks = [],
      i = 0,
      n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
}

var search = new Fuse(workerData.db, {
  keys: ['t', 'dc','kw'],
  threshold:0.4,
  minMatchCharLength:3
})
var resp = search.search(workerData.query) // Search with query
const allResults = resp.length
resp=chunk(resp,workerData.pageSize) // Chunk into pages
const pages = resp.length

var page = workerData.page
resp=resp[page-1]

if(page>pages || page<1){page=1};page=Math.round(page);

const timeTook = ((Math.round(performance.now()-time1)% 60000) / 1000).toFixed(2);

parentPort.postMessage({
  allResults:allResults,
  resp:resp,
  pages:pages,
  timeTook:timeTook
});

process.exit()
