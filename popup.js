document.getElementById('fetch').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCode' }, function (response) {
            if (response && response.code) {
                document.getElementById('code').textContent = response.code;
            } else {
                document.getElementById('code').textContent = 'Failed to fetch code.';
            }
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'submissionId') {
      const submissionId = request.submissionId;
  
      // Here you can use the submissionId to fetch the code and display it
      // For example:
      fetchCodeFromSubmissionId(submissionId).then(code => {
        document.querySelector('#code-container').innerHTML = `<pre><code>${code}</code></pre>`;
      });
    }
  });