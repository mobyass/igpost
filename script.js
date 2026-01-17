// Variables
let equipeA = null;
let equipeB = null;
let currentTeam = null;
let filteredClubs = [];

const clubList = document.getElementById("clubList");
const clubSearch = document.getElementById("clubSearch");

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

    div.onclick = () => {
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
    };

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

function setInfo1(txt, e) {
  info1.textContent = txt;
  setActive(e);
}

function setActive(e) {
  e.target.parentElement
    .querySelectorAll("button")
    .forEach(b => b.classList.remove("active"));

  e.target.classList.add("active");
}

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

capture.onmousedown = e => {
  dragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
};

window.onmousemove = e => {
  if (!dragging) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  clamp();
  apply();
};

window.onmouseup = () => dragging = false;

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
