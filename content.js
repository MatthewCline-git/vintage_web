// Hide the page immediately
document.documentElement.style.visibility = "hidden";

// Create loading overlay
const overlay = document.createElement("div");
overlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
`;

// Get delay setting and show appropriate message
chrome.storage.sync.get(["delaySeconds"], (result) => {
  const delaySeconds = result.delaySeconds || 3;
  const delayMs = delaySeconds * 1000;

  overlay.innerHTML = `
    <div style="text-align: center;">
      <h3>Loading...</h3>
      <p>Please wait ${delaySeconds} seconds...</p>
    </div>
  `;

  // Add overlay when DOM is ready
  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.appendChild(overlay);
    });
  }

  // After configured delay, show the actual page
  setTimeout(() => {
    overlay.remove();
    document.documentElement.style.visibility = "visible";
  }, delayMs);
});
