// Load saved settings when page opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["delaySeconds"], (result) => {
    document.getElementById("delay").value = result.delaySeconds || 3;
  });
});

// Save settings when button is clicked
document.getElementById("save").addEventListener("click", () => {
  const delaySeconds = parseFloat(document.getElementById("delay").value);

  // Validate input
  if (isNaN(delaySeconds) || delaySeconds < 0 || delaySeconds > 60) {
    showStatus("Please enter a valid delay between 0 and 60 seconds", false);
    return;
  }

  // Save to Chrome storage
  chrome.storage.sync.set({ delaySeconds }, () => {
    showStatus("Settings saved successfully!", true);
  });
});

function showStatus(message, isSuccess) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${isSuccess ? "success" : "error"}`;
  status.style.display = "block";

  // Hide after 3 seconds
  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}
