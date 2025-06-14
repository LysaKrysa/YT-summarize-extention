chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'get_transcript') {
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 1000));

        const items = document.querySelectorAll("ytd-transcript-segment-renderer");
        if (!items.length) {
          sendResponse({ success: false, error: 'Transcript not found' });
          return;
        }

        const text = Array.from(items).map(seg => {
          const tE = seg.querySelector("[class*='segment-text'], #content, #text");
          const timeE = seg.querySelector("[class*='segment-timestamp'], #timestamp");
          const t = tE?.textContent.trim() || '';
          const tm = timeE?.textContent.trim() || '';
          return msg.includeTimestamps ? `${tm} ${t}` : t;
        }).filter(Boolean).join('\n');

        sendResponse({ success: true, transcript: text });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();

    return true;
  }
});
