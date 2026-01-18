// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function () {

  // =====================
  // VARIABLES
  // =====================
  let equipeA = null;
  let equipeB = null;
  let currentTeam = null;

  // =====================
  // ELEMENTS DOM
  // =====================
  const clubList = document.getElementById("clubListModal");
  const clubSearch = document.getElementById("clubSearchModal");

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
  const btnShare = document.getElementById("btnShare");

  const bgImage = document.getElementById("bgImage");
  const capture = document.getElementById("capture");

  const modal = document.getElementById("clubModal");

  // =====================
  // SCORES
  // =====================
  inputScoreA.addEventListener("input", e => {
    displayScoreA.textContent = Math.max(0, e.target.value || 0);
  });

  inputScoreB.addEventListener("input", e => {
    displayScoreB.textContent = Math.max(0, e.target.value || 0);
  });

  inputInfo2.addEventListener("input", e => {
    info2.textContent = e.target.value;
  });

  // =====================
  // COMPETITION
  // =====================
  document.querySelectorAll('[data-competition]').forEach(btn => {
    btn.addEventListener("click", e => {
      info1.textContent = e.target.dataset.competition;
      e.target.parentElement.querySelectorAll("button")
        .forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // =====================
  // MODAL SELECTION
  // =====================
  document.getElementById("teamA-btn").addEventListener("click", () => openModal("A"));
  document.getElementById("teamB-btn").addEventListener("click", () => openModal("B"));

  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("closeModalX").addEventListener("click", closeModal);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  clubSearch.addEventListener("input", e => {
    renderModalList(e.target.value);
  });

  function openModal(team) {
    currentTeam = team;
    modal.classList.add("active");
    clubSearch.value = "";
    renderModalList("");
    clubSearch.focus();
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  function renderModalList(filter) {
    clubList.innerHTML = "";

    CLUBS
      .filter(c =>
        (c.nom + " " + (c.abbr || "")).toLowerCase().includes(filter.toLowerCase())
      )
      .slice(0, filter === "" ? 4 : CLUBS.length)
      .forEach(club => {
        const div = document.createElement("div");
        div.className = "club-option";
        div.innerHTML = `
          <div class="club-option-logo" style="background-image:url('${club.logo}')"></div>
          <div>${club.nom}</div>
        `;
        div.addEventListener("click", () => {
          selectTeam(club);
          closeModal();
        });
        clubList.appendChild(div);
      });
  }

  function selectTeam(club) {
    if (currentTeam === "A") {
      equipeA = club;
      updateTeam("A", club);
      logoA.style.backgroundImage = `url('${club.logo}')`;
    } else {
      equipeB = club;
      updateTeam("B", club);
      logoB.style.backgroundImage = `url('${club.logo}')`;
    }

    matchTitle.textContent =
      `${equipeA?.nom || "Équipe A"} - ${equipeB?.nom || "Équipe B"}`;
  }

  function updateTeam(team, club) {
    const display = document.getElementById(`team${team}-display`);
    const logo = document.getElementById(`team${team}-logo`);
    const name = document.getElementById(`team${team}-name`);
    const btn = document.getElementById(`team${team}-btn`);

    display.classList.add("selected");
    logo.style.backgroundImage = `url('${club.logo}')`;
    logo.classList.remove("empty-logo"); // 🔥 enlève le ?
    name.textContent = club.nom;
    btn.textContent = "Modifier";
  }

  // =====================
  // BACKGROUND / ZOOM
  // =====================
  const FRAME_W = 400;
  const FRAME_H = 500;

  let baseScale = 1;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;

  fileInput.addEventListener("change", loadBackground);
  btnZoom.addEventListener("click", () => toggleZoom(true));
  btnCloseZoom.addEventListener("click", () => toggleZoom(false));
  zoomSlider.addEventListener("input", e => zoomBg(e.target.value));

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
    document.getElementById("zoomControls")
      .classList.toggle("hidden", !show);
  }

  capture.addEventListener("mousedown", e => {
    dragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    clamp();
    apply();
  });

  window.addEventListener("mouseup", () => dragging = false);

  function clamp() {
    offsetX = Math.min(0, Math.max(FRAME_W - bgImage.width, offsetX));
    offsetY = Math.min(0, Math.max(FRAME_H - bgImage.height, offsetY));
  }

  function apply() {
    bgImage.style.left = offsetX + "px";
    bgImage.style.top = offsetY + "px";
  }

  // =====================
  // EXPORT / SHARE
  // =====================
  btnExport.addEventListener("click", exportImage);
  btnShare.addEventListener("click", shareImage);

  function exportImage() {
    html2canvas(capture, { scale: 4, useCORS: true }).then(canvas => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "post-match.png";
      a.click();
    });
  }

  function shareImage() {
    html2canvas(capture, { scale: 4, useCORS: true }).then(canvas => {
      canvas.toBlob(blob => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "post-match.png", { type: "image/png" });
          navigator.share({ files: [file] });
        } else {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]);
          alert("✅ Image copiée !");
        }
      });
    });
  }

});
