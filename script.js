// You can edit ALL of the code here
const SHOWS_URL = "https://api.tvmaze.com/shows";
const EPISODES_URL_BASE = "https://api.tvmaze.com/shows/";

let allShows = [];
let episodesCache = {};
let currentShowId = "";
let currentEpisodes = [];

let showsSection = null;
let showsSearchInput = null;
let showCountLine = null;
let showsListWrapper = null;

let episodesSection = null;
let showTitle = null;
let searchInput = null;
let episodeSelect = null;
let infoLine = null;
let cardsWrapper = null;

function setup() {
   buildPageFrame();
   loadShows();
}

async function loadShows() {
   showShowsMessage("Loading shows...");
   setShowsSearchEnabled(false);

   try {
      const response = await fetch(SHOWS_URL);
      if (!response.ok) {
         throw new Error("Failed to load shows");
      }

      const data = await response.json();
      allShows = sortShowsByName(data);
      renderShows(allShows);
      setShowsSearchEnabled(true);
   } catch (error) {
      showShowsMessage("Error: could not load shows.");
   }
}

function renderShows(showList) {
   showsListWrapper.innerHTML = "";

   if (showList.length === 0) {
      showShowsMessage("No shows found.");
      updateShowCount(showList);
      return;
   }

   for (let i = 0; i < showList.length; i++) {
      const showCard = createShowCard(showList[i]);
      showsListWrapper.appendChild(showCard);
   }

   updateShowCount(showList);
}

function updateShowCount(showList) {
   showCountLine.textContent =
      "Showing " + showList.length + " / " + allShows.length + " shows";
}

function handleShowSearchInput() {
   const term = showsSearchInput.value.trim().toLowerCase();

   if (term === "") {
      renderShows(allShows);
      return;
   }

   const matches = [];
   for (let i = 0; i < allShows.length; i++) {
      const show = allShows[i];
      const nameText = show.name.toLowerCase();
      const summaryText = show.summary ? show.summary.toLowerCase() : "";
      const genresText = show.genres ? show.genres.join(" ").toLowerCase() : "";

      if (
         nameText.includes(term) ||
         summaryText.includes(term) ||
         genresText.includes(term)
      ) {
         matches.push(show);
      }
   }

   renderShows(matches);
}

function openShow(show) {
   currentShowId = show.id.toString();
   showTitle.textContent = show.name;
   showEpisodesView();
   loadEpisodesForShow(currentShowId);
}

function createShowCard(show) {
   const card = document.createElement("article");
   card.className = "show-card";

   const titleButton = document.createElement("button");
   titleButton.type = "button";
   titleButton.className = "show-title";
   titleButton.textContent = show.name;
   titleButton.addEventListener("click", () => openShow(show));
   card.appendChild(titleButton);

   const showImage = makeShowImageElement(show);
   if (showImage) {
      card.appendChild(showImage);
   }

   const summaryBox = document.createElement("div");
   summaryBox.className = "show-summary";
   // The API gives summary HTML.
   if (show.summary) {
      summaryBox.innerHTML = show.summary;
   } else {
      summaryBox.textContent = "No summary for this show.";
   }
   card.appendChild(summaryBox);

   const genresText =
      show.genres && show.genres.length > 0 ? show.genres.join(", ") : "None";
   const statusText = show.status ? show.status : "Unknown";
   const ratingText =
      show.rating && show.rating.average !== null
         ? show.rating.average.toString()
         : "Not rated";
   const runtimeText = show.runtime ? show.runtime + " min" : "Unknown";

   card.appendChild(makeShowDetail("Genres", genresText));
   card.appendChild(makeShowDetail("Status", statusText));
   card.appendChild(makeShowDetail("Rating", ratingText));
   card.appendChild(makeShowDetail("Runtime", runtimeText));

   return card;
}

function makeShowDetail(label, value) {
   const line = document.createElement("p");
   line.className = "show-detail";
   line.textContent = label + ": " + value;
   return line;
}

function makeShowImageElement(show) {
   if (!show.image || !show.image.medium) {
      return null;
   }

   const image = document.createElement("img");
   image.src = show.image.medium;
   image.alt = show.name + " poster";
   image.loading = "lazy";
   return image;
}

async function loadEpisodesForShow(showId) {
   if (!showId) {
      return;
   }

   setEpisodeControlsEnabled(false);
   showEpisodesMessage("Loading episodes...");

   if (episodesCache[showId]) {
      setCurrentEpisodes(episodesCache[showId]);
      setEpisodeControlsEnabled(true);
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
      setEpisodeControlsEnabled(true);
   } catch (error) {
      showEpisodesMessage("Error: could not load episodes.");
   }
}

function setCurrentEpisodes(episodes) {
   currentEpisodes = episodes;
   searchInput.value = "";
   fillEpisodeSelect(currentEpisodes);
   showEpisodes(currentEpisodes);
}

function setEpisodeControlsEnabled(isEnabled) {
   searchInput.disabled = !isEnabled;
   episodeSelect.disabled = !isEnabled;
}

function setShowsSearchEnabled(isEnabled) {
   showsSearchInput.disabled = !isEnabled;
}

function showShowsMessage(message) {
   showsListWrapper.innerHTML = "<h2>" + message + "</h2>";
   showCountLine.textContent = "";
}

function showEpisodesMessage(message) {
   cardsWrapper.innerHTML = "<h2>" + message + "</h2>";
   infoLine.textContent = message;
}

function showShowsView() {
   showsSection.style.display = "block";
   episodesSection.style.display = "none";
}

function showEpisodesView() {
   showsSection.style.display = "none";
   episodesSection.style.display = "block";
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

   showsSection = document.createElement("section");
   showsSection.className = "view-section";

   const showsTitle = document.createElement("h1");
   showsTitle.textContent = "All Shows";
   showsSection.appendChild(showsTitle);

   const showsControls = document.createElement("section");
   showsControls.className = "controls";

   const showSearchLabel = document.createElement("label");
   showSearchLabel.textContent = "Search shows: ";

   showsSearchInput = document.createElement("input");
   showsSearchInput.type = "text";
   showsSearchInput.placeholder = "Type to filter shows";
   showsSearchInput.addEventListener("input", handleShowSearchInput);
   showSearchLabel.appendChild(showsSearchInput);
   showsControls.appendChild(showSearchLabel);

   showCountLine = document.createElement("p");
   showCountLine.textContent = "Showing 0 / 0 shows";
   showsControls.appendChild(showCountLine);

   showsSection.appendChild(showsControls);

   showsListWrapper = document.createElement("section");
   showsListWrapper.id = "shows-list";
   showsSection.appendChild(showsListWrapper);

   episodesSection = document.createElement("section");
   episodesSection.className = "view-section";

   const nav = document.createElement("div");
   nav.className = "nav";

   const backButton = document.createElement("button");
   backButton.type = "button";
   backButton.textContent = "Back to shows";
   backButton.addEventListener("click", showShowsView);
   nav.appendChild(backButton);
   episodesSection.appendChild(nav);

   showTitle = document.createElement("h2");
   showTitle.textContent = "Episodes";
   episodesSection.appendChild(showTitle);

   const controls = document.createElement("section");
   controls.className = "controls";

   const searchLabel = document.createElement("label");
   searchLabel.textContent = "Search episodes: ";

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

   episodesSection.appendChild(controls);

   cardsWrapper = document.createElement("section");
   cardsWrapper.id = "episode-list";
   episodesSection.appendChild(cardsWrapper);

   rootElem.appendChild(showsSection);
   rootElem.appendChild(episodesSection);

   showShowsView();
   setShowsSearchEnabled(false);
   setEpisodeControlsEnabled(false);
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
