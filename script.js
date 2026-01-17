// Variables
let equipeA = null;
let equipeB = null;
let currentTeam = null;

// Elements DOM
const clubList = document.getElementById("clubList");
const clubSearch = document.getElementById("clubSearch");
const btnTeamA = document.getElementById("btnTeamA");
const btnTeamB = document.getElementById("btnTeamB");
const logoA = document.getElementById("logoA");
const logoB = document.getElementById("logoB");
const matchTitle = document.getElementById("matchTitle");
const displayScoreA = document.getElementById("displayScoreA");
const displayScoreB = document.getElementById("displayScoreB");
const inputScoreA = document.getElementById("inputScoreA");
const inputScoreB = document.getElementById("inputScoreB");
const inputInfo2 = document.getElementById("inputInfo2");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const fileInput = document.getElementById("fileInput");
const btnZoom = document.getElementById("btnZoom");
const btnCloseZoom = document.getElementById("btnCloseZoom");
const zoomSlider = document.getElementById("zoomSlider");
const btnExport = document.getElementById("btnExport");
const bgImage = document.getElementById("bgImage");
const capture = document.getElementById("capture");

// Event Listeners
btnTeamA.addEventListener("click", () => openClubList("A"));
btnTeamB.addEventListener("click", () => openClubList("B"));

inputScoreA.addEventListener("input", (e) => {
  displayScoreA.textContent = Math.max(0, e.target.value || 0);
});

inputScoreB.addEventListener("input", (e) => {
  displayScoreB.textContent = Math.max(0, e.target.value || 0);
});

inputInfo2.addEventListener("input", (e) => {
  info2.textContent = e.target.value;
});

// Competition buttons
document.querySelectorAll('[data-competition]').forEach(btn => {
  btn.addEventListener("click", (e) => {
    const competition = e.target.dataset.competition;
    info1.textContent = competition;
    
    // Remove active class from all buttons
    e.target.parentElement.querySelectorAll("button").forEach(b => {
      b.classList.remove("active");
    });
    
    // Add active class to clicked button
    e.target.classList.add("active");
  });
});

fileInput.addEventListener("change", loadBackground);
btnZoom.addEventListener("click", () => toggleZoom(true));
btnCloseZoom.addEventListener("click", () => toggleZoom(false));
zoomSlider.addEventListener("input", (e) => zoomBg(e.target.value));
btnExport.addEventListener("click", exportImage);

// Functions
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

  const filtered = CLUBS.filter(club => {
    const txt = (club.nom + " " + (club.abbr || "")).toLowerCase();
    return txt.includes(filter.toLowerCase());
  }).slice(0, 4);

  filtered.forEach(club => {
    const div = document.createElement("div");
    div.className = "club-option";
    div.textContent = club.nom;

    div.addEventListener("click", () => {
      if (currentTeam === "A") {
        equipeA = club;
        logoA.style.backgroundImage = `url(${club.logo})`;
        btnTeamA.textContent = club.nom;
      } else {
        equipeB = club;
        logoB.style.backgroundImage = `url(${club.logo})`;
        btnTeamB.textContent = club.nom;
      }

      matchTitle.textContent =
        `${equipeA?.nom || "Équipe A"} - ${equipeB?.nom || "Équipe B"}`;

      clubList.classList.add("hidden");
      clubSearch.classList.add("hidden");
    });

    clubList.appendChild(div);
  });
}

clubSearch.addEventListener("input", () => {
  renderClubList(clubSearch.value);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    clubList.classList.add("hidden");
    clubSearch.classList.add("hidden");
  }
});

const FRAME_W = 400;
const FRAME_H = 500;

let baseScale = 1;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let startX = 0;
let startY = 0;

function loadBackground(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    bgImage.onload = () => {
      baseScale = Math.max(
        FRAME_W / bgImage.naturalWidth,
        FRAME_H / bgImage.naturalHeight
      );

      zoom = 1;

      bgImage.width = bgImage.naturalWidth * baseScale;
      bgImage.height = bgImage.naturalHeight * baseScale;

      offsetX = (FRAME_W - bgImage.width) / 2;
      offsetY = (FRAME_H - bgImage.height) / 2;

      apply();
    };
    bgImage.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function zoomBg(val) {
  const prevW = bgImage.width;
  const prevH = bgImage.height;

  zoom = Math.max(1, val);

  bgImage.width = bgImage.naturalWidth * baseScale * zoom;
  bgImage.height = bgImage.naturalHeight * baseScale * zoom;

  offsetX -= (bgImage.width - prevW) / 2;
  offsetY -= (bgImage.height - prevH) / 2;

  clamp();
  apply();
}

function toggleZoom(show) {
  const zoomControls = document.getElementById("zoomControls");
  zoomControls.classList.toggle("hidden", !show);
}

capture.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  clamp();
  apply();
});

window.addEventListener("mouseup", () => {
  dragging = false;
});

function clamp() {
  offsetX = Math.min(0, Math.max(FRAME_W - bgImage.width, offsetX));
  offsetY = Math.min(0, Math.max(FRAME_H - bgImage.height, offsetY));
}

function apply() {
  bgImage.style.left = offsetX + "px";
  bgImage.style.top = offsetY + "px";
}

function exportImage() {
  html2canvas(capture, { scale: 4, useCORS: true }).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "post-match.png";
    a.click();
  });
}
