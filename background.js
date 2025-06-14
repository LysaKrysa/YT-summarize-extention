chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === 'extract_transcript') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const transcriptButton = document.querySelector("ytd-video-description-transcript-section-renderer button");
          if (transcriptButton) transcriptButton.click();
        }
      });
    });
  }
});
