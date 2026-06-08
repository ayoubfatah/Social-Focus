const STYLE_ID = "socialfocus-styles";

const FULL_BLOCK_HOSTS = [
  "instagram.com",
  "facebook.com",
  "tiktok.com",
  "x.com",
  "linkedin.com",
];

const REDIRECTS = {
  instagram: "https://www.instagram.com/direct/inbox/",
  facebook: "https://www.facebook.com/messages/",
  tiktok: "https://www.tiktok.com/messages",
  x: "https://x.com/i/chat",
  linkedin: "https://www.linkedin.com/messaging/",
  youtube: "https://www.youtube.com/feed/subscriptions",
};

let lastUrl = location.href;
let observerStarted = false;
let applyingRules = false;

init();

function init() {
  chrome.storage.sync.get(
    ["isActive", "blockMode", "lockUntil"],
    applySettings,
  );

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync") return;

    const importantChange =
      changes.isActive || changes.blockMode || changes.lockUntil;

    if (!importantChange) return;

    chrome.storage.sync.get(
      ["isActive", "blockMode", "lockUntil"],
      applySettings,
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
      blockFullPlatforms();
      return;
    }

    if (host.includes("instagram.com")) {
      handlePlatform({
        path,
        isAllowed: isAllowedInstagram,
        redirectUrl: REDIRECTS.instagram,
        css: instagramCSS,
      });
      return;
    }

    if (host.includes("facebook.com")) {
      handlePlatform({
        path,
        isAllowed: isAllowedFacebook,
        redirectUrl: REDIRECTS.facebook,
        css: facebookCSS,
      });
      return;
    }

    if (host.includes("tiktok.com")) {
      handlePlatform({
        path,
        isAllowed: isAllowedTikTok,
        redirectUrl: REDIRECTS.tiktok,
        css: tiktokCSS,
      });
      return;
    }

    if (host.includes("x.com")) {
      handlePlatform({
        path,
        isAllowed: isAllowedX,
        redirectUrl: REDIRECTS.x,
        css: xCSS,
      });
      return;
    }

    if (host.includes("linkedin.com")) {
      handlePlatform({
        path,
        isAllowed: isAllowedLinkedIn,
        redirectUrl: REDIRECTS.linkedin,
        css: linkedinCSS,
      });
      return;
    }

    if (host.includes("youtube.com")) {
      handlePlatform({
        path,
        isAllowed: isAllowedYouTube,
        redirectUrl: REDIRECTS.youtube,
        css: youtubeCSS,
      });
    }
  } finally {
    applyingRules = false;
  }
}

function handlePlatform({ path, isAllowed, redirectUrl, css }) {
  if (!isAllowed(path)) {
    location.replace(redirectUrl);
    return;
  }

  injectStyle(css);
}

function blockFullPlatforms() {
  if (!isFullBlockHost(location.hostname)) return;

  const blockedPageUrl = chrome.runtime.getURL("blocked.html");

  if (location.href.startsWith(blockedPageUrl)) return;

  location.replace(blockedPageUrl);
}

function isFullBlockHost(host) {
  return FULL_BLOCK_HOSTS.some((domain) => host.includes(domain));
}

/*
   Allowed routes */

function isAllowedInstagram(path) {
  return path.startsWith("/direct");
}

function isAllowedFacebook(path) {
  return path.startsWith("/messages");
}

function isAllowedTikTok(path) {
  const isProfilePage =
    path.split("/").length === 2 &&
    path.length > 1 &&
    !path.startsWith("/foryou") &&
    !path.startsWith("/following");

  return (
    path.startsWith("/messages") || path.startsWith("/inbox") || isProfilePage
  );
}

function isAllowedX(path) {
  const isProfilePage =
    path.split("/").length === 2 &&
    path.length > 1 &&
    !path.startsWith("/home") &&
    !path.startsWith("/explore") &&
    !path.startsWith("/notifications") &&
    !path.startsWith("/messages") &&
    !path.startsWith("/i");

  return path.startsWith("/i/chat") || isProfilePage;
}

function isAllowedLinkedIn(path) {
  return path.startsWith("/messaging") || path.startsWith("/in/");
}

function isAllowedYouTube(path) {
  return !path.startsWith("/shorts");
}

/*
   CSS rules */

const instagramCSS = `
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
`;

const facebookCSS = `
  a[href="/"] { display: none !important; }
  a[href*="/watch"] { display: none !important; }
  a[href*="/reels"] { display: none !important; }
  a[href*="/stories"] { display: none !important; }

  [aria-label="Home"] a { display: none !important; }
  [aria-label="Watch"] { display: none !important; }
  [aria-label="Reels"] { display: none !important; }

  [data-pagelet="LeftRail"] a[href*="/watch"] {
    display: none !important;
  }
`;

const tiktokCSS = `
  a[href="/"] { display: none !important; }
  a[href="/following"] { display: none !important; }
  a[href="/foryou"] { display: none !important; }

  [data-e2e="nav-home"] { display: none !important; }
  [data-e2e="nav-following"] { display: none !important; }
  [data-e2e="recommend-list-item-container"] {
    display: none !important;
  }
`;

const xCSS = `
  a[href="/home"] { display: none !important; }
  a[href="/explore"] { display: none !important; }
  a[href="/notifications"] { display: none !important; }
  a[href="/messages"] { display: none !important; }

  [aria-label="Home"] { display: none !important; }
  [aria-label="Explore"] { display: none !important; }
  [aria-label="Follow"] { display: none !important; }
  [aria-label="Grok"] { display: none !important; }
  [aria-label="More menu items"] { display: none !important; }
  [aria-label="Post"] { display: none !important; }
  [aria-label="Premium"] { display: none !important; }
  [aria-label="Creator Studio"] { display: none !important; }
  [aria-label="Bookmarks"] { display: none !important; }
  [aria-label="Notifications"] { display: none !important; }
`;

const linkedinCSS = `
  a[href*="/feed"] { display: none !important; }
  a[href*="/mynetwork"] { display: none !important; }
  a[href*="/jobs"] { display: none !important; }
  a[href*="/notifications"] { display: none !important; }
`;

const youtubeCSS = `
  a[href^="/shorts"] { display: none !important; }

  ytd-rich-shelf-renderer[is-shorts] {
    display: none !important;
  }

  ytd-reel-shelf-renderer {
    display: none !important;
  }

  [is-shorts] {
    display: none !important;
  }

  ytd-guide-entry-renderer a[href="/shorts"] {
    display: none !important;
  }

  #endpoint[href^="/shorts"] {
    display: none !important;
  }

  ytd-mini-guide-entry-renderer a[href="/shorts"] {
    display: none !important;
  }

  a[title="Shorts"] {
    display: none !important;
  }
`;

/*
   Helpers */

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
      applySettings,
    );
  });

  const start = () => {
    observer.observe(document.documentElement || document, {
      subtree: true,
      childList: true,
    });
  };

  if (document.documentElement) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
}
