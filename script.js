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

  // Nouveaux éléments pour le recadrage
  const btnRecadrer = document.getElementById("btnRecadrer");
  const recadrageModal = document.getElementById("recadrageModal");
  const btnValiderRecadrage = document.getElementById("btnValiderRecadrage");
  const btnAnnulerRecadrage = document.getElementById("btnAnnulerRecadrage");
  const recadragePreview = document.getElementById("recadragePreview");
  const recadrageImage = document.getElementById("recadrageImage");
  const recadrageZoomSlider = document.getElementById("recadrageZoomSlider");

  // Éléments du preview de recadrage
  const recadrageInfo1 = document.getElementById("recadrage-info1");
  const recadrageInfo2 = document.getElementById("recadrage-info2");
  const recadrageMatchTitle = document.getElementById("recadrage-matchTitle");
  const recadrageLogoA = document.getElementById("recadrage-logoA");
  const recadrageLogoB = document.getElementById("recadrage-logoB");
  const recadrageScoreA = document.getElementById("recadrage-displayScoreA");
  const recadrageScoreB = document.getElementById("recadrage-displayScoreB");

  // =====================
  // SCORES
  // =====================
  inputScoreA.addEventListener("input", e => {
    const score = Math.max(0, e.target.value || 0);
    displayScoreA.textContent = score;
    recadrageScoreA.textContent = score;
  });

  inputScoreB.addEventListener("input", e => {
    const score = Math.max(0, e.target.value || 0);
    displayScoreB.textContent = score;
    recadrageScoreB.textContent = score;
  });

  inputInfo2.addEventListener("input", e => {
    info2.textContent = e.target.value;
    recadrageInfo2.textContent = e.target.value;
  });

  // =====================
  // COMPETITION
  // =====================
  document.querySelectorAll('[data-competition]').forEach(btn => {
    btn.addEventListener("click", e => {
      const comp = e.target.dataset.competition;
      info1.textContent = comp;
      recadrageInfo1.textContent = comp;
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
      recadrageLogoA.style.backgroundImage = `url('${club.logo}')`;
    } else {
      equipeB = club;
      updateTeam("B", club);
      logoB.style.backgroundImage = `url('${club.logo}')`;
      recadrageLogoB.style.backgroundImage = `url('${club.logo}')`;
    }

    const titre = `${equipeA?.nom || "Équipe A"} - ${equipeB?.nom || "Équipe B"}`;
    matchTitle.textContent = titre;
    recadrageMatchTitle.textContent = titre;
  }

  function updateTeam(team, club) {
    const display = document.getElementById(`team${team}-display`);
    const logo = document.getElementById(`team${team}-logo`);
    const name = document.getElementById(`team${team}-name`);
    const btn = document.getElementById(`team${team}-btn`);

    display.classList.add("selected");
    logo.style.backgroundImage = `url('${club.logo}')`;
    logo.classList.remove("empty-logo");
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

  // Variables pour le recadrage
  let recadrageActive = false;
  let recadrageZoom = 1;
  let recadrageOffsetX = 0;
  let recadrageOffsetY = 0;
  let recadrageDragging = false;
  let recadrageStartX = 0;
  let recadrageStartY = 0;
  let recadrageTouchDistance = 0;

  fileInput.addEventListener("change", loadBackground);

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
        
        // Activer le bouton recadrer
        btnRecadrer.disabled = false;
      };
      bgImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function apply() {
    bgImage.style.left = offsetX + "px";
    bgImage.style.top = offsetY + "px";
  }

  // =====================
  // MODE RECADRAGE
  // =====================
  btnRecadrer.addEventListener("click", openRecadrage);
  btnValiderRecadrage.addEventListener("click", validerRecadrage);
  btnAnnulerRecadrage.addEventListener("click", annulerRecadrage);

  function openRecadrage() {
    if (!bgImage.src) return;

    recadrageActive = true;
    recadrageModal.classList.add("active");
    
    // Copier l'image actuelle dans le preview
    recadrageImage.src = bgImage.src;
    
    // Synchroniser tous les éléments visuels
    recadrageInfo1.textContent = info1.textContent;
    recadrageInfo2.textContent = info2.textContent;
    recadrageMatchTitle.textContent = matchTitle.textContent;
    recadrageScoreA.textContent = displayScoreA.textContent;
    recadrageScoreB.textContent = displayScoreB.textContent;
    recadrageLogoA.style.backgroundImage = logoA.style.backgroundImage;
    recadrageLogoB.style.backgroundImage = logoB.style.backgroundImage;
    
    // Copier les paramètres actuels
    recadrageZoom = zoom;
    recadrageOffsetX = offsetX;
    recadrageOffsetY = offsetY;
    
    // Initialiser le slider
    recadrageZoomSlider.value = zoom;
    
    // Appliquer les styles
    recadrageImage.onload = () => {
      recadrageImage.width = bgImage.naturalWidth * baseScale * recadrageZoom;
      recadrageImage.height = bgImage.naturalHeight * baseScale * recadrageZoom;
      applyRecadrage();
    };
    
    // Bloquer le scroll de la page
    document.body.style.overflow = 'hidden';
  }

  function validerRecadrage() {
    // Appliquer les changements à l'image principale
    zoom = recadrageZoom;
    offsetX = recadrageOffsetX;
    offsetY = recadrageOffsetY;
    
    bgImage.width = bgImage.naturalWidth * baseScale * zoom;
    bgImage.height = bgImage.naturalHeight * baseScale * zoom;
    apply();
    
    fermerRecadrage();
  }

  function annulerRecadrage() {
    fermerRecadrage();
  }

  function fermerRecadrage() {
    recadrageActive = false;
    recadrageModal.classList.remove("active");
    document.body.style.overflow = '';
  }

  function applyRecadrage() {
    recadrageImage.style.left = recadrageOffsetX + "px";
    recadrageImage.style.top = recadrageOffsetY + "px";
  }

  function clampRecadrage() {
    recadrageOffsetX = Math.min(0, Math.max(FRAME_W - recadrageImage.width, recadrageOffsetX));
    recadrageOffsetY = Math.min(0, Math.max(FRAME_H - recadrageImage.height, recadrageOffsetY));
  }

  // Gestion du zoom via slider
  recadrageZoomSlider.addEventListener("input", e => {
    const prevW = recadrageImage.width;
    const prevH = recadrageImage.height;
    recadrageZoom = Math.max(1, parseFloat(e.target.value));

    recadrageImage.width = bgImage.naturalWidth * baseScale * recadrageZoom;
    recadrageImage.height = bgImage.naturalHeight * baseScale * recadrageZoom;

    recadrageOffsetX -= (recadrageImage.width - prevW) / 2;
    recadrageOffsetY -= (recadrageImage.height - prevH) / 2;

    clampRecadrage();
    applyRecadrage();
  });

  // Gestion du drag (souris)
  recadragePreview.addEventListener("mousedown", e => {
    e.preventDefault();
    recadrageDragging = true;
    recadrageStartX = e.clientX - recadrageOffsetX;
    recadrageStartY = e.clientY - recadrageOffsetY;
  });

  window.addEventListener("mousemove", e => {
    if (!recadrageDragging) return;
    e.preventDefault();
    recadrageOffsetX = e.clientX - recadrageStartX;
    recadrageOffsetY = e.clientY - recadrageStartY;
    clampRecadrage();
    applyRecadrage();
  });

  window.addEventListener("mouseup", () => {
    recadrageDragging = false;
  });

  // Gestion tactile (mobile)
  recadragePreview.addEventListener("touchstart", handleTouchStart, { passive: false });
  recadragePreview.addEventListener("touchmove", handleTouchMove, { passive: false });
  recadragePreview.addEventListener("touchend", handleTouchEnd, { passive: false });

  function handleTouchStart(e) {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Un doigt : déplacer
      recadrageDragging = true;
      recadrageStartX = e.touches[0].clientX - recadrageOffsetX;
      recadrageStartY = e.touches[0].clientY - recadrageOffsetY;
    } else if (e.touches.length === 2) {
      // Deux doigts : zoom
      recadrageDragging = false;
      recadrageTouchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 1 && recadrageDragging) {
      // Déplacement
      recadrageOffsetX = e.touches[0].clientX - recadrageStartX;
      recadrageOffsetY = e.touches[0].clientY - recadrageStartY;
      clampRecadrage();
      applyRecadrage();
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scale = newDistance / recadrageTouchDistance;
      const prevW = recadrageImage.width;
      const prevH = recadrageImage.height;
      
      recadrageZoom = Math.min(3, Math.max(1, recadrageZoom * scale));
      recadrageImage.width = bgImage.naturalWidth * baseScale * recadrageZoom;
      recadrageImage.height = bgImage.naturalHeight * baseScale * recadrageZoom;
      
      recadrageOffsetX -= (recadrageImage.width - prevW) / 2;
      recadrageOffsetY -= (recadrageImage.height - prevH) / 2;
      
      clampRecadrage();
      applyRecadrage();
      
      recadrageZoomSlider.value = recadrageZoom;
      recadrageTouchDistance = newDistance;
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length === 0) {
      recadrageDragging = false;
    }
  }

  // =====================
  // ANCIEN ZOOM (caché maintenant)
  // =====================
  btnZoom.addEventListener("click", () => toggleZoom(true));
  btnCloseZoom.addEventListener("click", () => toggleZoom(false));
  zoomSlider.addEventListener("input", e => zoomBg(e.target.value));

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
