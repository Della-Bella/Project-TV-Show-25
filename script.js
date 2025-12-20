// You can edit ALL of the code here
const SHOWS_URL = "https://api.tvmaze.com/shows";
const EPISODES_URL_BASE = "https://api.tvmaze.com/shows/";

let allShows = [];
let episodesCache = {};
let currentShowId = "";
let currentEpisodes = [];

let cardsWrapper = null;
let infoLine = null;
let searchInput = null;
let episodeSelect = null;
let showSelect = null;

function setup() {
   buildPageFrame();
   loadShows();
}

async function loadShows() {
   showLoadingMessage("Loading shows...");
   setControlsEnabled(false);
   setShowSelectEnabled(false);

   try {
      const response = await fetch(SHOWS_URL);
      if (!response.ok) {
         throw new Error("Failed to load shows");
      }

      const data = await response.json();
      allShows = sortShowsByName(data);
      fillShowSelect(allShows);
      setShowSelectEnabled(true);

      const firstShowId = pickInitialShowId(allShows);
      if (firstShowId) {
         showSelect.value = firstShowId;
         await loadEpisodesForShow(firstShowId);
      } else {
         showErrorMessage("No shows found.");
      }
   } catch (error) {
      showErrorMessage("Error: could not load shows.");
   }
}

async function loadEpisodesForShow(showId) {
   if (!showId) {
      return;
   }

   currentShowId = showId;
   setControlsEnabled(false);
   showLoadingMessage("Loading episodes...");

   if (episodesCache[showId]) {
      setCurrentEpisodes(episodesCache[showId]);
      setControlsEnabled(true);
      return;
   }

   try {
      const response = await fetch(EPISODES_URL_BASE + showId + "/episodes");
      if (!response.ok) {
         throw new Error("Failed to load episodes");
      }

      const data = await response.json();
      if (showId !== currentShowId) {
         return;
      }

      episodesCache[showId] = data;
      setCurrentEpisodes(data);
      setControlsEnabled(true);
   } catch (error) {
      showErrorMessage("Error: could not load episodes.");
   }
}

function setCurrentEpisodes(episodes) {
   currentEpisodes = episodes;
   searchInput.value = "";
   fillEpisodeSelect(currentEpisodes);
   showEpisodes(currentEpisodes);
}

function setControlsEnabled(isEnabled) {
   searchInput.disabled = !isEnabled;
   episodeSelect.disabled = !isEnabled;
}

function setShowSelectEnabled(isEnabled) {
   showSelect.disabled = !isEnabled;
}

function showLoadingMessage(message) {
   cardsWrapper.innerHTML = "<h2>" + message + "</h2>";
   infoLine.textContent = message;
}

function showErrorMessage(message) {
   cardsWrapper.innerHTML = "<h2 style=\"color: red;\">" + message + "</h2>";
   infoLine.textContent = message;
}

function sortShowsByName(showList) {
   const copy = showList.slice();
   copy.sort((showA, showB) => {
      const nameA = showA.name.toLowerCase();
      const nameB = showB.name.toLowerCase();
      return nameA.localeCompare(nameB);
   });
   return copy;
}

function pickInitialShowId(showList) {
   for (let i = 0; i < showList.length; i++) {
      if (showList[i].id === 82) {
         return showList[i].id.toString();
      }
   }

   if (showList.length === 0) {
      return "";
   }

   return showList[0].id.toString();
}

function padToTwoDigits(number) {
   const asText = number.toString();
   if (asText.length === 1) {
      return "0" + asText;
   }
   return asText;
}

function makeEpisodeCode(season, episodeNumber) {
   return "S" + padToTwoDigits(season) + "E" + padToTwoDigits(episodeNumber);
}

function makeImageElement(episode) {
   if (!episode.image || !episode.image.medium) {
      return null;
   }
   const image = document.createElement("img");
   image.src = episode.image.medium;
   image.alt = episode.name + " poster";
   image.loading = "lazy";
   return image;
}

function makeSummaryElement(summaryHTML) {
   const summaryBox = document.createElement("div");
   if (summaryHTML) {
      summaryBox.innerHTML = summaryHTML;
   } else {
      summaryBox.textContent = "No summary for this episode.";
   }
   return summaryBox;
}

function makeTitleElement(episode) {
   const title = document.createElement("h1");
   title.textContent =
      episode.name + " - " + makeEpisodeCode(episode.season, episode.number);
   return title;
}

function makeInfoElement(episode) {
   const info = document.createElement("p");
   info.textContent = "Season " + episode.season + " Episode " + episode.number;
   return info;
}

function createEpisodeCard(episode) {
   const card = document.createElement("div");
   card.className = "episode-card";
   card.id = "episode-" + episode.id;
   card.appendChild(makeTitleElement(episode));
   card.appendChild(makeInfoElement(episode));
   const cardImage = makeImageElement(episode);
   if (cardImage) {
      card.appendChild(cardImage);
   }
   card.appendChild(makeSummaryElement(episode.summary));
   return card;
}

function buildPageFrame() {
   const rootElem = document.getElementById("root");
   rootElem.innerHTML = "";

   const controls = document.createElement("section");
   controls.className = "controls";

   const showLabel = document.createElement("label");
   showLabel.textContent = "Show: ";

   showSelect = document.createElement("select");
   showSelect.addEventListener("change", handleShowChange);
   showLabel.appendChild(showSelect);
   controls.appendChild(showLabel);

   const searchLabel = document.createElement("label");
   searchLabel.textContent = "Search: ";

   searchInput = document.createElement("input");
   searchInput.type = "text";
   searchInput.placeholder = "Type to filter episodes";
   searchInput.addEventListener("input", handleSearchInput);
   searchLabel.appendChild(searchInput);
   controls.appendChild(searchLabel);

   infoLine = document.createElement("p");
   infoLine.textContent = "Showing 0 / 0 episodes";
   controls.appendChild(infoLine);

   const selectLabel = document.createElement("label");
   selectLabel.textContent = "Go to episode: ";

   episodeSelect = document.createElement("select");
   episodeSelect.addEventListener("change", handleSelectChange);
   selectLabel.appendChild(episodeSelect);
   controls.appendChild(selectLabel);

   const credit = document.createElement("p");
   credit.innerHTML =
      'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze</a>';
   controls.appendChild(credit);

   rootElem.appendChild(controls);

   cardsWrapper = document.createElement("section");
   cardsWrapper.id = "episode-list";
   rootElem.appendChild(cardsWrapper);

   setControlsEnabled(false);
   setShowSelectEnabled(false);
}

function fillShowSelect(showList) {
   while (showSelect.options.length > 0) {
      showSelect.remove(0);
   }

   for (let i = 0; i < showList.length; i++) {
      const show = showList[i];
      const option = document.createElement("option");
      option.value = show.id.toString();
      option.textContent = show.name;
      showSelect.appendChild(option);
   }
}

function fillEpisodeSelect(episodeList) {
   while (episodeSelect.options.length > 0) {
      episodeSelect.remove(0);
   }

   const allOption = document.createElement("option");
   allOption.value = "all";
   allOption.textContent = "Show all episodes";
   episodeSelect.appendChild(allOption);

   for (let i = 0; i < episodeList.length; i++) {
      const episode = episodeList[i];
      const option = document.createElement("option");
      option.value = episode.id.toString();
      option.textContent =
         makeEpisodeCode(episode.season, episode.number) + " - " + episode.name;
      episodeSelect.appendChild(option);
   }
}

function showEpisodes(episodeList) {
   cardsWrapper.innerHTML = "";

   for (let i = 0; i < episodeList.length; i++) {
      const episode = episodeList[i];
      const card = createEpisodeCard(episode);
      cardsWrapper.appendChild(card);
   }

   infoLine.textContent =
      "Showing " +
      episodeList.length +
      " / " +
      currentEpisodes.length +
      " episodes";
}

function handleShowChange() {
   const selectedId = showSelect.value;
   if (selectedId === currentShowId) {
      return;
   }
   loadEpisodesForShow(selectedId);
}

function handleSearchInput() {
   const term = searchInput.value.trim().toLowerCase();
   episodeSelect.value = "all";

   if (term === "") {
      showEpisodes(currentEpisodes);
      return;
   }

   const matches = [];
   for (let i = 0; i < currentEpisodes.length; i++) {
      const episode = currentEpisodes[i];
      const nameText = episode.name.toLowerCase();
      const summaryText = episode.summary ? episode.summary.toLowerCase() : "";

      if (nameText.includes(term) || summaryText.includes(term)) {
         matches.push(episode);
      }
   }

   showEpisodes(matches);
}

function handleSelectChange() {
   const choice = episodeSelect.value;

   if (choice === "all") {
      showEpisodes(currentEpisodes);
      return;
   }

   searchInput.value = "";

   for (let i = 0; i < currentEpisodes.length; i++) {
      const episode = currentEpisodes[i];
      if (episode.id.toString() === choice) {
         showEpisodes([episode]);
         const card = document.getElementById("episode-" + episode.id);
         if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "start" });
         }
         return;
      }
   }
}

window.onload = setup;
