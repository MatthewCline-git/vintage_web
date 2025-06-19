// Year to delay mapping (in seconds)
const yearDelays = {
  2024: 0, // Modern fiber - instant
  2020: 0.5, // High-speed broadband
  2015: 1, // Standard broadband
  2010: 2, // ADSL2+
  2005: 4, // Basic broadband
  2000: 8, // Early broadband/DSL
  1998: 15, // 56k dial-up - the classic experience
  1995: 25, // 28.8k dial-up - patience required
  1992: 45, // 14.4k dial-up - grab a coffee
  1990: 60, // 9600 baud - time for a sandwich
};

// Year descriptions
const yearDescriptions = {
  2024: "Lightning fast! Modern fiber connections with virtually no loading time. The internet as it should be.",
  2020: "High-speed broadband era. Pages load quickly, streaming is smooth. Life is good.",
  2015: "Standard broadband. Most pages load reasonably fast. Netflix is becoming a thing.",
  2010: "ADSL2+ connections. YouTube works, but HD videos might buffer. Facebook is king.",
  2005: "Basic broadband is spreading. Websites are getting fancier. MySpace rules the world.",
  2000: "Early broadband and DSL! Faster than dial-up but still patience required. Napster anyone?",
  1998: "The classic 56k dial-up experience! That familiar handshake sound. 'Get off the internet, I need to use the phone!'",
  1995: "28.8k dial-up days. Images load line by line. You plan your browsing carefully. AOL CDs everywhere.",
  1992: "14.4k dial-up. Loading a single image takes forever. Text-based browsing is your friend.",
  1990: "9600 baud modem. The stone age of internet. Mostly bulletin boards and text. Patience is a virtue.",
};

// Load saved settings when page opens
document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById("year");
  const yearInfo = document.getElementById("yearInfo");

  // Load saved year
  chrome.storage.sync.get(["selectedYear"], (result) => {
    const savedYear = result.selectedYear || "1995";
    yearSelect.value = savedYear;
    updateYearInfo(savedYear);
  });

  // Update info when year changes
  yearSelect.addEventListener("change", (e) => {
    updateYearInfo(e.target.value);
  });
});

// Update year information display
function updateYearInfo(year) {
  const yearInfo = document.getElementById("yearInfo");
  const delay = yearDelays[year];
  const description = yearDescriptions[year];

  yearInfo.innerHTML = `
    <strong>Delay: ${delay} seconds</strong><br>
    ${description}
  `;
}

// Save settings when button is clicked
document.getElementById("save").addEventListener("click", () => {
  const selectedYear = document.getElementById("year").value;

  // Save to Chrome storage
  chrome.storage.sync.set(
    {
      selectedYear: selectedYear,
      delaySeconds: yearDelays[selectedYear],
    },
    () => {
      showStatus(
        `Time machine set to ${selectedYear}! Enjoy your retro browsing experience!`,
        true
      );
    }
  );
});

function showStatus(message, isSuccess) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${isSuccess ? "success" : "error"}`;
  status.style.display = "block";

  // Hide after 4 seconds
  setTimeout(() => {
    status.style.display = "none";
  }, 4000);
}
