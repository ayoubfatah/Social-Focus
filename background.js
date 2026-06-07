const DEFAULT_SETTINGS = {
  isActive: true,
  blockMode: "reels",
  lockUntil: 0
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (result) => {
    const next = {};

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (result[key] === undefined) next[key] = value;
    }

    if (Object.keys(next).length > 0) {
      chrome.storage.sync.set(next);
    }
  });
});
