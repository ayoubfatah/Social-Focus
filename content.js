const STYLE_ID = "socialfocus-styles";
const SOCIAL_HOSTS = [
  "instagram.com",
  "facebook.com",
  "tiktok.com",
  "youtube.com",
  "x.com",
  "linkedin.com",
];
const SOCIAL_HOSTS_FULL_BLOCK = [
  "instagram.com",
  "facebook.com",
  "tiktok.com",
  "x.com",
  "linkedin.com",
];

let lastUrl = location.href;
let observerStarted = false;
let applyingRules = false;

init();

function init() {
  chrome.storage.sync.get(
    ["isActive", "blockMode", "lockUntil"],
    (settings) => {
      applySettings(settings);
    },
  );

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync") return;

    const importantChange =
      changes.isActive || changes.blockMode || changes.lockUntil;
    if (!importantChange) return;

    chrome.storage.sync.get(
      ["isActive", "blockMode", "lockUntil"],
      (settings) => {
        applySettings(settings);
      },
    );
  });

  watchUrlChanges();
}

function applySettings(settings) {
  const now = Date.now();
  const lockUntil = Number(settings.lockUntil || 0);
  const isLocked = lockUntil > now;
  const isActive = settings.isActive !== false || isLocked;
  const blockMode = settings.blockMode || "reels";

  if (isLocked && settings.isActive === false) {
    chrome.storage.sync.set({ isActive: true });
  }

  removeStyle();
  if (!isActive) return;

  applyRules(blockMode);
}

function applyRules(blockMode = "reels") {
  if (applyingRules) return;
  applyingRules = true;

  try {
    const host = location.hostname;
    const path = location.pathname;

    if (blockMode === "full") {
      blockWholeSocialMedia();
      return;
    }

    if (host.includes("instagram.com")) handleInstagram(path);
    if (host.includes("facebook.com")) handleFacebook(path);
    if (host.includes("tiktok.com")) handleTikTok(path);
    if (host.includes("youtube.com")) handleYouTube(path);
    if (host.includes("x.com")) handleX(path);
    if (host.includes("linkedin.com")) handleLinkedIn(path);
  } finally {
    applyingRules = false;
  }
}

function blockWholeSocialMedia() {
  if (!isSocialHostFullBlock(location.hostname)) return;
  if (location.href.startsWith(chrome.runtime.getURL("blocked.html"))) return;

  location.replace(chrome.runtime.getURL("blocked.html"));
}

function isSocialHost(host) {
  return SOCIAL_HOSTS.some((domain) => host.includes(domain));
}
function isSocialHostFullBlock(host) {
  return SOCIAL_HOSTS_FULL_BLOCK.some((domain) => host.includes(domain));
}

// linkedin

function handleLinkedIn(path) {
  const blocked =
    path === "/" ||
    path === "" ||
    path.startsWith("/feed") ||
    path.startsWith("/mynetwork") ||
    path.startsWith("/jobs") ||
    path.startsWith("/notifications");

  if (blocked) {
    location.replace("https://www.linkedin.com/messaging/");
    return;
  }
  injectStyle(`
    a[href="https://www.linkedin.com/feed/?nis=true&"] { display: none !important; }
    a[href="https://www.linkedin.com/mynetwork/?"] { display: none !important; }
    a[href="https://www.linkedin.com/jobs/?"] { display: none !important; }
    a[href="https://www.linkedin.com/jobs/?"] { display: none !important; }
    a[href="https://www.linkedin.com/notifications/?"] { display: none !important; }
    a[href="https://www.linkedin.com/notifications/?filter=all&refresh=true"] { display: none !important; }

  `);
}

// X
function handleX(path) {
  const blocked =
    path === "/" ||
    path === "" ||
    path.startsWith("/home") ||
    path.startsWith("/explore") ||
    path.startsWith("/notifications") ||
    path.startsWith("/messages");

  if (blocked) {
    location.replace("https://x.com/i/chat");
    return;
  }

  injectStyle(`
    a[href="/home"] { display: none !important; }
    a[href="/explore"] { display: none !important; }
    a[href="/notifications"] { display: none !important; }
    a[href="/messages"] { display: none !important; }
    [aria-label="Home"] { display: none !important; }
    [aria-label="Explore"] { display: none !important; }
    [aria-label="Follow"] { display: none !important; }
    [aria-label="Grok"] { display: none !important; }
    [aria-label="More menu items"] { display: none !important; }
    [aria-label="Profile"] { display: none !important; }
    [aria-label="Post"] { display: none !important; }
    [aria-label="Premium"] { display: none !important; }
    [aria-label="Creator Studio"] { display: none !important; }
    [aria-label="Bookmarks"] { display: none !important; }
    [aria-label="Notifications"] { display: none !important; }
  `);
}
// Instagram
function handleInstagram(path) {
  const blocked =
    path === "/" ||
    path === "" ||
    path.startsWith("/reels") ||
    path.startsWith("/explore") ||
    path.startsWith("/p/");

  if (blocked) {
    location.replace("https://www.instagram.com/direct/inbox/");
    return;
  }

  injectStyle(`
    a[href="/"] { display: none !important; }
    a[href="/reels/"] { display: none !important; }
    a[href="/explore/"] { display: none !important; }
    [aria-label="Reels"] { display: none !important; }
    [aria-label="Search"] { display: none !important; }
    [href*="/reels"] { display: none !important; }
    [href*="/explore"] { display: none !important; }
    a:has(svg[aria-label="Search"]) { display: none !important; }
    a:has(svg[aria-label="Notifications"]) { display: none !important; }
    a:has(svg[aria-label="New post"]) { display: none !important; }
  }
  }
  `);
}

// Facebook
function handleFacebook(path) {
  const blocked =
    path === "/" ||
    path === "" ||
    path.startsWith("/watch") ||
    path.startsWith("/reel") ||
    path.startsWith("/stories") ||
    path.startsWith("/video");

  if (blocked) {
    location.replace("https://www.facebook.com/messages/");
    return;
  }

  injectStyle(`
    a[href="/"] { display: none !important; }
    a[href*="/watch"] { display: none !important; }
    a[href*="/reels"] { display: none !important; }
    a[href*="/stories"] { display: none !important; }
    [aria-label="Home"] a { display: none !important; }
    [aria-label="Watch"] { display: none !important; }
    [aria-label="Reels"] { display: none !important; }
    [data-pagelet="LeftRail"] a[href*="/watch"] { display: none !important; }
  `);
}

// TikTok
function handleTikTok(path) {
  const isProfilePage = path.split("/").length === 2 && path.length > 1;
  const isAllowed =
    path.startsWith("/messages") || path.startsWith("/inbox") || isProfilePage;

  if (!isAllowed) {
    location.replace("https://www.tiktok.com/messages");
    return;
  }

  injectStyle(`
    a[href="/"] { display: none !important; }
    a[href="/following"] { display: none !important; }
    a[href="/foryou"] { display: none !important; }
    [data-e2e="nav-home"] { display: none !important; }
    [data-e2e="nav-following"] { display: none !important; }
    [data-e2e="recommend-list-item-container"] { display: none !important; }
  `);
}

// YouTube
function handleYouTube(path) {
  if (path === "/" || path.startsWith("/shorts")) {
    location.replace("https://www.youtube.com/feed/subscriptions");
    return;
  }

  injectStyle(`
    a[href^="/shorts"] { display: none !important; }
    ytd-rich-shelf-renderer[is-shorts] { display: none !important; }
    ytd-reel-shelf-renderer { display: none !important; }
    [is-shorts] { display: none !important; }
    ytd-guide-entry-renderer a[href="/shorts"] { display: none !important; }
    #endpoint[href^="/shorts"] { display: none !important; }
    ytd-mini-guide-entry-renderer a[href="/shorts"] { display: none !important; }
  `);
}

// Helpers
function injectStyle(css) {
  const target = document.head || document.documentElement;
  if (!target) return;

  let style = document.getElementById(STYLE_ID);

  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    target.appendChild(style);
  }

  style.textContent = css;
}

function removeStyle() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

function watchUrlChanges() {
  if (observerStarted) return;
  observerStarted = true;

  const observer = new MutationObserver(() => {
    if (location.href === lastUrl) return;

    lastUrl = location.href;
    chrome.storage.sync.get(
      ["isActive", "blockMode", "lockUntil"],
      (settings) => {
        applySettings(settings);
      },
    );
  });

  const start = () => {
    observer.observe(document.documentElement || document, {
      subtree: true,
      childList: true,
    });
  };

  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
}
