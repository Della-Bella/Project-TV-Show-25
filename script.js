// You can edit ALL of the code here
const EPISODES_URL = "https://api.tvmaze.com/shows/82/episodes";

let allEpisodes = [];
let cardsWrapper = null;
let infoLine = null;
let searchInput = null;
let episodeSelect = null;

function setup() {
   buildPageFrame();
   loadEpisodes();
}

async function loadEpisodes() {
   // We fetch the data only one time when the page starts.
   showLoadingMessage();

   try {
      const response = await fetch(EPISODES_URL);
      if (!response.ok) {
         throw new Error("Failed to load data");
      }

      const data = await response.json();
      allEpisodes = data;

      setControlsEnabled(true);
      fillEpisodeSelect(allEpisodes);
      showEpisodes(allEpisodes);
   } catch (error) {
      // Show an error to real users, not only in the console.
      showErrorMessage();
      setControlsEnabled(false);
   }
}

function setControlsEnabled(isEnabled) {
   searchInput.disabled = !isEnabled;
   episodeSelect.disabled = !isEnabled;
}

function showLoadingMessage() {
   cardsWrapper.innerHTML = "<h2>Loading episodes... please wait.</h2>";
   infoLine.textContent = "Loading episodes...";
}

function showErrorMessage() {
   cardsWrapper.innerHTML =
      "<h2 style=\"color: red;\">Error: could not load episodes.</h2>";
   infoLine.textContent = "Could not load episodes.";
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

   // Disable controls until we have data.
   setControlsEnabled(false);
}

function fillEpisodeSelect(episodeList) {
   // Clear old options before adding new ones.
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
      allEpisodes.length +
      " episodes";
}

function handleSearchInput() {
   const term = searchInput.value.trim().toLowerCase();
   episodeSelect.value = "all";

   if (term === "") {
      showEpisodes(allEpisodes);
      return;
   }

   const matches = [];
   for (let i = 0; i < allEpisodes.length; i++) {
      const episode = allEpisodes[i];
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
      showEpisodes(allEpisodes);
      return;
   }

   searchInput.value = "";

   for (let i = 0; i < allEpisodes.length; i++) {
      const episode = allEpisodes[i];
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
