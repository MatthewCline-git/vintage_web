let delayedTabs = new Set();

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only delay main frame navigations (not iframes)
  if (details.frameId === 0) {
    const tabId = details.tabId;

    // Skip if this tab is already being delayed
    if (delayedTabs.has(tabId)) {
      return;
    }

    // Mark this tab as being delayed
    delayedTabs.add(tabId);

    // Stop the current navigation
    chrome.tabs.update(tabId, { url: "about:blank" });

    // After 3 seconds, navigate to the intended URL
    setTimeout(() => {
      chrome.tabs.update(tabId, { url: details.url });
      delayedTabs.delete(tabId);
    }, 3000);
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delayedTabs.delete(tabId);
});
