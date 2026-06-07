document.addEventListener("DOMContentLoaded", () => {
  const mainToggle = document.getElementById("mainToggle");
  const masterToggle = document.getElementById("masterToggle");
  const toggleLabel = document.getElementById("toggleLabel");
  const statusBadge = document.getElementById("statusBadge");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const reelsMode = document.getElementById("reelsMode");
  const fullMode = document.getElementById("fullMode");
  const reelsModeCard = document.getElementById("reelsModeCard");
  const fullModeCard = document.getElementById("fullModeCard");
  const timerMinutes = document.getElementById("timerMinutes");
  const startTimerBtn = document.getElementById("startTimerBtn");
  const timerStatus = document.getElementById("timerStatus");
  const linkedinLink = document.getElementById("linkedinLink");

  let currentSettings = {
    isActive: true,
    blockMode: "reels",
    lockUntil: 0
  };

  let countdownId = null;

  loadState();

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync") return;
    if (changes.isActive || changes.blockMode || changes.lockUntil) loadState();
  });

  function loadState() {
    chrome.storage.sync.get(["isActive", "blockMode", "lockUntil"], (result) => {
      currentSettings = {
        isActive: result.isActive !== false,
        blockMode: result.blockMode || "reels",
        lockUntil: Number(result.lockUntil || 0)
      };

      const locked = isLocked();

      if (locked && !currentSettings.isActive) {
        currentSettings.isActive = true;
        chrome.storage.sync.set({ isActive: true });
      }

      setUI();
      startCountdown();
    });
  }

  function isLocked() {
    return Number(currentSettings.lockUntil || 0) > Date.now();
  }

  function setUI() {
    const locked = isLocked();
    const isActive = currentSettings.isActive || locked;
    const blockMode = currentSettings.blockMode || "reels";

    mainToggle.checked = isActive;
    mainToggle.disabled = locked;
    timerMinutes.disabled = locked;
    startTimerBtn.disabled = locked;
    reelsMode.disabled = locked;
    fullMode.disabled = locked;

    masterToggle.classList.toggle("disabled", locked);
    reelsModeCard.classList.toggle("disabled", locked);
    fullModeCard.classList.toggle("disabled", locked);

    reelsMode.checked = blockMode === "reels";
    fullMode.checked = blockMode === "full";
    reelsModeCard.classList.toggle("selected", blockMode === "reels");
    fullModeCard.classList.toggle("selected", blockMode === "full");

    if (locked) {
      toggleLabel.textContent = blockMode === "full" ? "Full block locked" : "Reels block locked";
      statusBadge.className = "status-badge locked";
      statusDot.className = "status-dot active";
      statusText.textContent = "Locked";
      return;
    }

    if (isActive) {
      toggleLabel.textContent = blockMode === "full" ? "Full social block enabled" : "Reels / feeds blocked";
      statusBadge.className = "status-badge active";
      statusDot.className = "status-dot active";
      statusText.textContent = "Active";
    } else {
      toggleLabel.textContent = "Protection paused";
      statusBadge.className = "status-badge inactive";
      statusDot.className = "status-dot";
      statusText.textContent = "Paused";
    }
  }

  function setActive(active) {
    if (isLocked()) {
      setUI();
      return;
    }

    currentSettings.isActive = active;
    chrome.storage.sync.set({ isActive: active });
    setUI();
  }

  function setMode(mode) {
    if (isLocked()) {
      setUI();
      return;
    }

    currentSettings.blockMode = mode;
    chrome.storage.sync.set({ blockMode: mode, isActive: true });
    currentSettings.isActive = true;
    setUI();
  }

  function startTimer() {
    if (isLocked()) return;

    const minutes = Number(timerMinutes.value);
    if (!Number.isFinite(minutes) || minutes < 1) {
      timerMinutes.value = "1";
      return;
    }

    const safeMinutes = Math.min(minutes, 1440);
    const lockUntil = Date.now() + safeMinutes * 60 * 1000;

    currentSettings.isActive = true;
    currentSettings.lockUntil = lockUntil;

    chrome.storage.sync.set({
      isActive: true,
      blockMode: currentSettings.blockMode || "reels",
      lockUntil
    });

    setUI();
    startCountdown();
  }

  function startCountdown() {
    if (countdownId) clearInterval(countdownId);

    renderTimerStatus();

    countdownId = setInterval(() => {
      renderTimerStatus();

      if (!isLocked()) {
        clearInterval(countdownId);
        countdownId = null;
        chrome.storage.sync.set({ lockUntil: 0 });
        currentSettings.lockUntil = 0;
        setUI();
      }
    }, 1000);
  }

  function renderTimerStatus() {
    const remaining = Number(currentSettings.lockUntil || 0) - Date.now();

    if (remaining <= 0) {
      timerStatus.textContent = "No active lock.";
      timerStatus.className = "timer-status";
      return;
    }

    const totalSeconds = Math.ceil(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : `${minutes}m ${seconds}s`;

    timerStatus.textContent = `Locked for ${formatted}. You cannot disable focus mode yet.`;
    timerStatus.className = "timer-status locked";
  }

  mainToggle.addEventListener("change", () => setActive(mainToggle.checked));

  masterToggle.addEventListener("click", (event) => {
    if (event.target.closest(".switch")) return;
    setActive(!mainToggle.checked);
  });

  reelsModeCard.addEventListener("click", () => setMode("reels"));
  fullModeCard.addEventListener("click", () => setMode("full"));
  reelsMode.addEventListener("change", () => setMode("reels"));
  fullMode.addEventListener("change", () => setMode("full"));
  startTimerBtn.addEventListener("click", startTimer);

  linkedinLink.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: "https://www.linkedin.com/in/ayoub-fatah-445ab0300/" });
  });
});
