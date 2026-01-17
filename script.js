

// DOM
const clubList = document.getElementById("clubList");
const clubSearch = document.getElementById("clubSearch");
const btnTeamA = document.getElementById("btnTeamA");
const btnTeamB = document.getElementById("btnTeamB");
const logoA = document.getElementById("logoA");
const logoB = document.getElementById("logoB");
const matchTitle = document.getElementById("matchTitle");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const bgImage = document.getElementById("bgImage");
const capture = document.getElementById("capture");

// Scores
scoreAInput.oninput = e => displayScoreA.textContent = e.target.value || 0;
scoreBInput.oninput = e => displayScoreB.textContent = e.target.value || 0;
info2Input.oninput = e => info2.textContent = e.target.value;

// Teams
let equipeA = null;
let equipeB = null;
let currentTeam = null;

btnTeamA.onclick = () => openClubList("A");
btnTeamB.onclick = () => openClubList("B");

function openClubList(team) {
  currentTeam = team;
  clubList.innerHTML = "";
  clubList.classList.remove("hidden");
  clubSearch.classList.remove("hidden");
  clubSearch.value = "";
  renderClubList("");
}

function renderClubList(filter) {
  clubList.innerHTML = "";

  CLUBS.filter(c =>
    (c.nom + c.abbr).toLowerCase().includes(filter.toLowerCase())
  ).slice(0, 4).forEach(club => {
    const div = document.createElement("div");
    div.className = "club-option";
    div.textContent = club.nom;
    div.onclick = () => selectClub(club);
    clubList.appendChild(div);
  });
}

function selectClub(club) {
  if (currentTeam === "A") {
    equipeA = club;
    logoA.style.backgroundImage = `url(${club.logo})`;
    btnTeamA.textContent = club.nom;
  } else {
    equipeB = club;
    logoB.style.backgroundImage = `url(${club.logo})`;
    btnTeamB.textContent = club.nom;
  }

  matchTitle.textContent = `${equipeA?.nom || "Équipe A"} - ${equipeB?.nom || "Équipe B"}`;
  clubList.classList.add("hidden");
  clubSearch.classList.add("hidden");
}

clubSearch.oninput = () => renderClubList(clubSearch.value);

// Competition buttons
document.querySelectorAll(".button-group button").forEach(btn => {
  btn.onclick = e => {
    info1.textContent = btn.dataset.info;
    btn.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

// Background & export (logique inchangée)
document.getElementById("bgInput").onchange = loadBackground;
document.getElementById("exportBtn").onclick = exportImage;
