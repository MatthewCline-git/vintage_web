// Enhanced retro browsing experience with delay simulation
(function () {
  let currentTimeout;
  let isNavigating = false;
  let delayMs;

  // Hide the page immediately
  document.documentElement.style.visibility = "hidden";
  document.documentElement.style.cursor = "wait";

  // Add retro message based on year and delay
  chrome.storage.sync.get(["selectedYear", "delaySeconds"], (result) => {
    const delaySeconds = Math.max(0, result.delaySeconds || 25);
    delayMs = delaySeconds * 1000;

    // Initial page load delay
    showPageAfterDelay();

    // Intercept link clicks to apply delay (with capture for Shadow DOM)
    document.addEventListener("click", handleLinkClick, true);

    // Intercept form submissions
    document.addEventListener("submit", handleFormSubmit);

    // YouTube-specific: Monitor URL changes more aggressively
    startURLMonitoring();

    // Handle browser back/forward navigation
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    // Intercept SPA navigation (History API)
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
    if (isNavigating) return; // Prevent multiple simultaneous navigations

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
      // Check if it's a same-origin link OR a YouTube-style navigation
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
          // For YouTube and other complex SPAs, try both methods
          if (link.click && typeof link.click === "function") {
            // Simulate a real click
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

  function handleFormSubmit(e) {
    if (isNavigating) {
      e.preventDefault();
      return;
    }

    const form = e.target;
    if (form && form.tagName === "FORM") {
      // Only delay forms that stay on the same origin
      const formAction = form.action || window.location.href;
      const actionUrl = new URL(formAction, window.location.origin);

      if (actionUrl.origin === location.origin) {
        e.preventDefault();

        hidePageWithDelay();

        clearCurrentTimeout();
        currentTimeout = setTimeout(() => {
          // Manually submit the form
          form.submit();
        }, delayMs);
      }
    }
  }

  function handlePageShow(e) {
    // This fires when navigating back/forward or when page becomes visible
    if (e.persisted) {
      // Page was restored from cache (back/forward navigation)
      document.documentElement.style.visibility = "hidden";
      document.documentElement.style.cursor = "wait";
      isNavigating = false;
      showPageAfterDelay();
    }
  }

  function handlePageHide(e) {
    // Clean up when leaving the page
    clearCurrentTimeout();
    isNavigating = false;
  }

  // Handle cases where the page might already be visible (edge cases)
  if (document.readyState === "complete") {
    // If page is already loaded, still apply the delay
    showPageAfterDelay();
  }

  function startURLMonitoring() {
    let lastUrl = location.href;

    // Poll for URL changes (catches PJAX and other custom navigation)
    const urlCheckInterval = setInterval(() => {
      if (location.href !== lastUrl && !isNavigating) {
        console.log("URL change detected:", lastUrl, "→", location.href);
        lastUrl = location.href;

        // Apply delay for URL changes
        hidePageWithDelay();
        showPageAfterDelay();
      }
    }, 100);

    // Clean up interval when page unloads
    window.addEventListener("beforeunload", () => {
      clearInterval(urlCheckInterval);
    });
  }

  function interceptHistoryAPI() {
    // Store original methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    // Override pushState
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

    // Override replaceState
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

    // Also intercept popstate (back/forward in SPAs)
    window.addEventListener("popstate", (e) => {
      if (!isNavigating) {
        hidePageWithDelay();
        showPageAfterDelay();
      }
    });
  }

  // Emergency escape hatch - press Ctrl+Shift+R to bypass delay
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
