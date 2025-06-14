(async () => {
  const loadBtn = document.getElementById('load');
  const txt = document.querySelector('textarea');
  const timestamps = document.getElementById('timestamps');
  const summarize = document.getElementById('summarize');

  loadBtn.addEventListener('click', async () => {
    txt.value = 'Loading...';

    try {
      await chrome.runtime.sendMessage('extract_transcript');

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { 
                type: 'get_transcript', 
                includeTimestamps: timestamps.checked 
            },
            async response => {
                if (chrome.runtime.lastError) {
                txt.value = `Error: ${chrome.runtime.lastError.message}`;
                return;
                }

                if (!response) {
                txt.value = 'No content script or not a video page.';
                } else if (!response.success) {
                txt.value = `Error: ${response.error}`;
                } else {
                let result = response.transcript;

                if (summarize.checked) {
                    txt.value = "Summarizing...";
                    result = await summarizeWithOpenAI(result);
                }

                txt.value = result;
                }
            }
            );

      });
    } catch (err) {
      txt.value = `Popup error: ${err.message}`;
    }
  });

async function summarizeWithOpenAI(text) {
  const inputText = `Summarize this text while keeping important parts. Cover everything, don't skip anything. Just make it shorter:\n\n${text}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer API_KEY_HERE", // Replace with your OpenAI API key
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes text without skipping any key points." },
        { role: "user", content: inputText }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  if (data.error) return `Error: ${data.error.message}`;
  return data.choices?.[0]?.message?.content || "No summary generated.";
}


})();
