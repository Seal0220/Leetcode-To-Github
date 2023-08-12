console.log("Background script is running!");


chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (
      details.method === "POST" &&
      details.url === "https://leetcode.com/graphql/" &&
      details.requestBody
    ) {
      try {
        // 將 ArrayBuffer 轉換為字串
        const decoder = new TextDecoder("utf-8");
        const requestBody = details.requestBody.raw[0].bytes;
        const payloadStr = decoder.decode(requestBody);

        // 將字串解析為 JSON
        const payload = JSON.parse(payloadStr);

        // 檢查 operationName
        if (payload.operationName === "submissionDetails") {
          console.log("Detected submissionDetails request");
          console.log(payload);
        }
      } catch (error) {
        console.error("Error parsing request body:", error);
      }
    }
  },
  { urls: ["<all_urls>"] }, // 您可以更精確地指定 URL 模式
  ["requestBody"]
);


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "SUBMISSION_DETAILS") {
    var submissionDetails = request.payload;
    // Process the data as needed
    console.log("Submission details received in background:", submissionDetails);
  }
});



