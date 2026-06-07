# SocialFocus

A Chrome extension that helps you stay focused by blocking the distracting parts of social media, such as reels, shorts, feeds, explore pages, and stories.

SocialFocus lets you choose between blocking only addictive content or blocking full social media websites completely. It also includes a focus timer lock, so once a session starts, the selected mode cannot be disabled from the popup until the timer ends.

## Features

- Block YouTube Shorts
- Block Instagram Reels, Explore, and feed pages
- Block Facebook Watch, Reels, Stories, and feed pages
- Block TikTok For You and feed pages
- Block X / Twitter feed and distracting sections
- Keep useful pages like messages and profiles accessible
- Switch between partial blocking and full social media blocking
- Lock the current focus mode with a timer
- Keep the timer lock active after page reloads and browser restarts
- Simple popup UI for controlling focus mode

## Blocking Modes

### Reels / Feed Protection

This mode blocks the distracting parts of social media while still allowing useful pages.

Examples:

- YouTube is allowed, but Shorts are blocked
- Instagram messages are allowed, but Reels and Explore are blocked
- TikTok profiles/messages are allowed, but the For You feed is blocked
- X / Twitter messages and profiles are allowed, but the main feed is blocked

### Full Social Block

This mode blocks supported social media websites completely.

When enabled, opening a blocked platform redirects the user to a blocked page instead of allowing access.

## Focus Timer Lock

SocialFocus includes a timer lock for focus sessions.

When the timer is active:

- The extension cannot be disabled from the popup
- The blocking mode cannot be changed to a weaker mode
- The timer continues after hard reloads
- The timer continues after closing and reopening the browser

The timer state is stored using `chrome.storage.sync`.

## Supported Platforms

- YouTube
- Instagram
- Facebook
- TikTok
- X / Twitter

## Tech Stack

- Chrome Extension Manifest V3
- JavaScript
- HTML
- CSS
- Chrome Storage API
- Content scripts
- DOM manipulation
- URL redirect logic

## Project Structure

```txt
socialfocus-extension/
  manifest.json
  background.js
  content.js
  popup.html
  popup.js
  blocked.html
  icons/
    icon16.png
    icon32.png
    icon48.png
    icon128.png
```

## Files

- `manifest.json` — Chrome extension configuration
- `background.js` — Sets default extension settings on install
- `content.js` — Handles blocking, redirects, injected styles, and URL changes
- `popup.html` — Popup interface
- `popup.js` — Popup state, toggles, blocking mode logic, and timer lock
- `blocked.html` — Page shown when full social block mode is active
- `icons/` — Extension icons used in Chrome and the toolbar

## How to Install Locally

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `socialfocus-extension` folder.
6. Pin the extension to your Chrome toolbar.

## How to Use

1. Open the extension popup.
2. Choose a blocking mode:
   - **Only block reels / feeds**
   - **Block full social media**

3. Choose the timer duration.
4. Click **Start timer**.
5. The selected focus mode will stay locked until the timer finishes.

## Important Note

SocialFocus can prevent disabling focus mode from inside the popup while the timer is active.

However, Chrome extensions cannot fully stop a user from manually disabling or removing the extension from `chrome://extensions`. This is a browser security limitation.

## Why I Built This

I built SocialFocus because I wanted to use social media intentionally without getting trapped by infinite scrolling, reels, shorts, and feeds.

The goal is not to block every platform forever.
The goal is to keep the useful parts and remove the parts that waste attention.

## Future Improvements

- Add custom blocked websites
- Add daily focus statistics
- Add schedule-based blocking
- Add password-protected settings
- Add better platform-specific controls
- Improve the blocked page design

## License

This project is for learning and personal productivity.
