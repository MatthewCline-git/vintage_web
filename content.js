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

    // Intercept link clicks to apply delay
    document.addEventListener("click", handleLinkClick);

    // Intercept form submissions
    document.addEventListener("submit", handleFormSubmit);

    // Handle browser back/forward navigation
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);
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
    if (
      link &&
      link.href &&
      link.origin === location.origin &&
      !link.hasAttribute("target") &&
      !isNavigating
    ) {
      e.preventDefault();

      hidePageWithDelay();

      clearCurrentTimeout();
      currentTimeout = setTimeout(() => {
        window.location.href = link.href;
      }, delayMs);
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
