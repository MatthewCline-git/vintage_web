(function () {
  let currentTimeout;
  let isNavigating = false;
  let delayMs;

  // hide the page immediately
  document.documentElement.style.visibility = "hidden";
  document.documentElement.style.cursor = "wait";

  chrome.storage.sync.get(["selectedYear", "delaySeconds"], (result) => {
    const delaySeconds = Math.max(0, result.delaySeconds || 25);
    delayMs = delaySeconds * 1000;

    // initial page load delay
    showPageAfterDelay();

    // intercept link clicks to apply delay (with capture for Shadow DOM)
    document.addEventListener("click", handleLinkClick, true);

    // youTube-specific: Monitor URL changes more aggressively
    startURLMonitoring();

    // handle browser back/forward navigation
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    // intercept SPA navigation (History API)
    interceptHistoryAPI();
  });

  function showPageAfterDelay() {
    clearCurrentTimeout();

    currentTimeout = setTimeout(() => {
      document.documentElement.style.visibility = "visible";
      document.documentElement.style.cursor = "";
      isNavigating = false;
      currentTimeout = null;
    }, delayMs);
  }

  function hidePageWithDelay() {
    if (isNavigating) return; // prevent multiple simultaneous navigations

    isNavigating = true;
    document.documentElement.style.visibility = "hidden";
    document.documentElement.style.cursor = "wait";
  }

  function clearCurrentTimeout() {
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
  }

  function handleLinkClick(e) {
    const link = e.target.closest("a");
    if (link && link.href && !link.hasAttribute("target") && !isNavigating) {
      // check if it's a same-origin link OR a YouTube-style navigation
      const linkUrl = new URL(link.href);
      const currentUrl = new URL(location.href);

      if (
        linkUrl.origin === currentUrl.origin ||
        linkUrl.hostname === currentUrl.hostname
      ) {
        e.preventDefault();
        e.stopPropagation();

        hidePageWithDelay();

        clearCurrentTimeout();
        currentTimeout = setTimeout(() => {
          // for YouTube and other complex SPAs, try both methods
          // simulate mouse click
          if (link.click && typeof link.click === "function") {
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            link.dispatchEvent(clickEvent);
          } else {
            window.location.href = link.href;
          }
        }, delayMs);
      }
    }
  }

  function handlePageShow(e) {
    // this fires when navigating back/forward or when page becomes visible
    if (e.persisted) {
      // page was restored from cache (back/forward navigation)
      document.documentElement.style.visibility = "hidden";
      document.documentElement.style.cursor = "wait";
      isNavigating = false;
      showPageAfterDelay();
    }
  }

  function handlePageHide(e) {
    // clean up when leaving the page
    clearCurrentTimeout();
    isNavigating = false;
  }

  // handle cases where the page might already be visible
  if (document.readyState === "complete") {
    showPageAfterDelay();
  }

  function startURLMonitoring() {
    let lastUrl = location.href;

    // poll for URL changes (catches PJAX and other custom navigation)
    const urlCheckInterval = setInterval(() => {
      if (location.href !== lastUrl && !isNavigating) {
        console.log("URL change detected:", lastUrl, "→", location.href);
        lastUrl = location.href;

        // apply delay for URL changes
        hidePageWithDelay();
        showPageAfterDelay();
      }
    }, 100);

    // clean up interval when page unloads
    window.addEventListener("beforeunload", () => {
      clearInterval(urlCheckInterval);
    });
  }

  function interceptHistoryAPI() {
    // store original methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // override pushState
    history.pushState = function (state, title, url) {
      if (
        !isNavigating &&
        url &&
        url !== location.pathname + location.search + location.hash
      ) {
        hidePageWithDelay();

        clearCurrentTimeout();
        currentTimeout = setTimeout(() => {
          originalPushState.call(history, state, title, url);
          showPageAfterDelay();
        }, delayMs);
      } else {
        originalPushState.call(history, state, title, url);
      }
    };

    // override replaceState
    history.replaceState = function (state, title, url) {
      if (
        !isNavigating &&
        url &&
        url !== location.pathname + location.search + location.hash
      ) {
        hidePageWithDelay();

        clearCurrentTimeout();
        currentTimeout = setTimeout(() => {
          originalReplaceState.call(history, state, title, url);
          showPageAfterDelay();
        }, delayMs);
      } else {
        originalReplaceState.call(history, state, title, url);
      }
    };

    // intercept popstate for SPAs
    window.addEventListener("popstate", (e) => {
      if (!isNavigating) {
        hidePageWithDelay();
        showPageAfterDelay();
      }
    });
  }

  // bypass delay
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "R") {
      clearCurrentTimeout();
      document.documentElement.style.visibility = "visible";
      document.documentElement.style.cursor = "";
      isNavigating = false;
      console.log("Retro delay bypassed!");
    }
  });
})();
