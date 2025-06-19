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
  background: linear-gradient(45deg, #1e3c72 0%, #2a5298 100%);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  color: #00ff00;
`;

// Get settings and show appropriate retro message
chrome.storage.sync.get(["selectedYear", "delaySeconds"], (result) => {
  const selectedYear = result.selectedYear || "1995";
  const delaySeconds = result.delaySeconds || 25;
  const delayMs = delaySeconds * 1000;

  // Get retro message based on year
  let loadingMessage = getRetroMessage(selectedYear, delaySeconds);

  overlay.innerHTML = `
    <div style="
      text-align: center;
      background: rgba(0, 0, 0, 0.8);
      padding: 40px;
      border-radius: 10px;
      border: 2px solid #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
      max-width: 500px;
    ">
      <h2 style="
        color: #00ff00;
        margin-bottom: 20px;
        text-shadow: 0 0 10px #00ff00;
        font-size: 24px;
      ">🕰️ TIME MACHINE ACTIVE</h2>
      <div style="
        color: #ffffff;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 20px;
      ">${loadingMessage}</div>
      <div style="
        color: #ffff00;
        font-size: 14px;
        animation: blink 1s infinite;
      ">⏳ Loading... Please wait ${delaySeconds} seconds</div>
    </div>
    <style>
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
    </style>
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

function getRetroMessage(year, delay) {
  const messages = {
    2024: "Welcome to the future! Instant loading activated.",
    2020: "High-speed broadband simulation running...",
    2015: "Standard broadband experience loading...",
    2010: "ADSL2+ connection established. Buffering...",
    2005: "Basic broadband active. Loading MySpace-era speeds...",
    2000: "Early broadband engaged. Y2K-compliant loading...",
    1998: "*DIAL-UP SOUNDS* EEEEeeeee AWWWWwwww<br>Connecting at 56k... Don't pick up the phone!",
    1995: "28.8k modem active. Time to make some coffee...<br>Remember when images loaded line by line?",
    1992: "14.4k connection established. Grab a snack...<br>This is authentic early internet experience!",
    1990: "9600 baud modem engaged. Maybe read a book?<br>Welcome to the stone age of the internet!",
  };

  return messages[year] || messages[1995];
}
