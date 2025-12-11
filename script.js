//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function padToTwoDigits(number) {
  // This keeps numbers like 3 as 03
  const asText = number.toString();
  if (asText.length === 1) {
    return "0" + asText;
  }
  return asText;
}

function makeEpisodeCode(season, episodeNumber) {
  // This makes the code like S01E01
  return "S" + padToTwoDigits(season) + "E" + padToTwoDigits(episodeNumber);
}

function makeImageElement(episode) {
  // This stops the page breaking when no image
  if (!episode.image || !episode.image.medium) {
    return null;
  }
  const image = document.createElement("img");
  image.src = episode.image.medium;
  image.alt = episode.name + " poster";
  return image;
}

function makeSummaryElement(summaryHTML) {
  // This gives a short text when summary is empty
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
  title.textContent = episode.name + " - " + makeEpisodeCode(episode.season, episode.number);
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
  card.appendChild(makeTitleElement(episode));
  card.appendChild(makeInfoElement(episode));
  const cardImage = makeImageElement(episode);
  if (cardImage) {
    cardImage.loading = "lazy";
    card.appendChild(cardImage);
  }
  card.appendChild(makeSummaryElement(episode.summary));
  return card;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data from <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze</a>';
  rootElem.appendChild(credit);

  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    rootElem.appendChild(card);
  });
}

window.onload = setup;
