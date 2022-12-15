// Prepare to see the messiest code, like, ever.

function getParameterByName(name) {
  return new URLSearchParams(window.location.search).get(name);
}

var query = getParameterByName("q");
var page = getParameterByName("page");

document.getElementsByClassName("searchbar")[0].value = query;

function mould(error) {
  document.getElementById("searchingCheese").setAttribute("hidden", true);
  document.getElementById("searchingMould").removeAttribute("hidden");
  document.getElementsByClassName("status")[0].innerText = error;
}

function protect(text) {
  // Replaces stuff with stuff
  return text
    .replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/&nbsp;/g, " ");
}

function newSearch() {
  window.location.href =
    "search.html?q=" + document.getElementsByClassName("searchbar")[0].value;
}

document
  .getElementsByClassName("searchbar")[0]
  .addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      newSearch();
    }
  });

if (!isNaN(Number(page))) {
  urlToFetch = `../api/${query}/${page}`;
} else {
  urlToFetch = `../api/${query}`;
  page = 1;
}

(async () => {
  var verified = (await (await fetch("../Verified/list.json")).json()) || [];
  var cheeses = (await (await fetch("./cheeses.json")).json()) || [];

  fetch(urlToFetch)
    .then(async function (r) {
      if (r.status == 204) {
        mould(`No results found for ${query}`);
        return;
      }

      const json = await r.json();
      if (json.error) {
        mould(json.reason);
        return;
      }

      document.getElementById("searchingCheese").setAttribute("hidden", true);
      document.getElementsByClassName("status")[0].setAttribute("hidden", true);

      let results = ``;
      for (let i = 0; i < json.results.length; i++) {
        const element = json.results[i];
        results += `<div class="result">`;
        if (verified.includes(new URL(element.href).host)) {
          results += `<a class="url" href="${element.href}"><span class="material-symbols-outlined">check</span> ${element.title}</a>`;
        } else
          results += `<a class="url" href="${element.href}">${element.title}</a>`;
        results += `
        <p class="description">${element.description}</p>
        <p class="urlText">${protect(element.href)}</p>
    </div><br>`;
      }

      let didYouMean = "";
      if (query !== json.didYouMean) {
        didYouMean = `<h3>Did you meen <a href="search.html?q=${encodeURIComponent(
          json.didYouMean
        )}">${json.didYouMean}</a>?</h3>`;
      }

      let cheeseEmbed = "";
      let titleParsed = query.trim().toLowerCase().replace(/ /g, "").replace(/'/g,"")
      console.log(titleParsed)
      for(let i=0; i<cheeses.length; i++){
        if(cheeses[i].title == titleParsed){
          cheeseEmbed = `<div id="cheeseEmbed">
            <img src="${cheeses[i].image}">
            <h2>${cheeses[i].displayTitle}</h2>
            <p>Sourced fresh from cheese.com</p>
            <button onclick="window.open('${cheeses[i].url}')">More info</button>
            <button onclick="window.open('/randomcheese')">Random cheese</button>
          </div>`
        }
      }

      let resultsHtml = `<div class="topResults">${json.resultsCount
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} results for '${protect(
        query
      )}' found in aboot ${json.timeInSeconds} seconds.</p>${didYouMean}
    </div>
    <br>
    ${cheeseEmbed}
    ${results}
    <div class="page">
        <p>Page ${json.page}/${json.pages} <br> 
            <button onclick='window.location.href="search.html?q=${query
              .split(" ")
              .join("%20")}"'><span class="material-symbols-outlined">first_page</span></button>
            <button onclick='window.location.href="search.html?q=${query
              .split(" ")
              .join("%20")}&page=${
        json.page - 1
      }"'><span class="material-symbols-outlined">arrow_back</span></button> 
            <button onclick='window.location.href="search.html?q=${query
              .split(" ")
              .join("%20")}&page=${
        json.page + 1
      }"'><span class="material-symbols-outlined">arrow_forward</span></button> 
            <button onclick='window.location.href="search.html?q=${query
              .split(" ")
              .join("%20")}&page=${
        json.pages
      }"'><span class="material-symbols-outlined">last_page</span></button>
        </p>
    </div>
    <br><br>`;
      document
        .getElementsByClassName("morePadding")[0]
        .insertBefore(
          document.createElement("div"),
          document.getElementsByClassName("morePadding")[0].firstChild
        ).innerHTML = resultsHtml;
    })
    .catch(function (e) {
      mould(`Unexpected error: ${e}`);
    });
})();
