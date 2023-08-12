const languages = {
    'C++': '.cpp',
    'Java': '.java',
    'Python': '.py',
    'Python3': '.py',
    'C': '.c',
    'C#': '.cs',
    'JavaScript': '.js',
    'Ruby': '.rb',
    'Swift': '.swift',
    'Go': '.go',
    'Scala': '.scala',
    'Kotlin': '.kt',
    'Rust': '.rs',
    'PHP': '.php',
    'TypeScript': '.ts',
    'Racket': '.rkt',
    'Erlang': '.erl',
    'Elixir': '.ex',
    'Dart': '.dart',
    'MySQL': '.sql'
};

function getCodeFromLeetCode() {
    const codeContainer = document.querySelector('.view-lines.monaco-mouse-cursor-text');
    if (codeContainer) {
        const codeLines = codeContainer.querySelectorAll('.view-line');

        let code = '';
        codeLines.forEach(line => {
            code += line.textContent + '\n';
        });

        console.log(code)
        return code;
    }
    return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCode') {
        const code = getCodeFromLeetCode();
        sendResponse({ code });
    }
});



window.addEventListener('message', function (event) {
    if (event.source === window) {
        var message = event.data;

        if ((typeof message === 'object' || message !== null || message.type)) {
            if (message.type === 'SUBMISSION_DETAILS' || message.type === 'QUESTION') {
                var data = message.payload;
                console.log('DATA received:', data);

                switch (message.type) {
                    case 'SUBMISSION_DETAILS':
                        var data_inner = data.data.submissionDetails;
                        var name = `${data.questionId.toString().padStart(4, '0')}_${data.questionTitleSlug}`;
                        var filename = name + languages[data_inner.lang.verboseName];

                        var header = {
                            repo: 'leetcode',
                            user: 'Seal0220',
                            path: `${name}/${filename}`
                        }

                        var body = {
                            commit: `Runtime: ${data_inner.runtime} ms (beats: ${parseFloat(data_inner.runtimePercentile.toFixed(1))}%), Memory: ${data_inner.memoryDisplay} (beats: ${parseFloat(data_inner.memoryPercentile.toFixed(1))})`,
                            content: data_inner.code
                        }

                        pushToGitHub(header, body);
                        break
                    case 'QUESTION':
                        var data_inner = data.data.question;
                        var name = `${data.questionId.toString().padStart(4, '0')}_${data.questionTitleSlug}`;
                        var filename = 'Description.md';

                        var header = {
                            repo: 'leetcode',
                            user: 'Seal0220',
                            path: `${name}/${filename}`
                        }

                        var body = {
                            commit: data.questionlink,
                            content: `<h1>${data.questionId}. ${data.questionTitle}</h1>${data_inner.content}<br><br><hr>${data.questionlink}`
                        }

                        pushToGitHub(header, body);
                        break
                }
            }
        }
    }
});


// function ensureDirectoryExists(path, accessToken, user, repo) {
//     const parts = path.split('/');
//     let currentPath = '';

//     const checkAndCreate = (index) => {
//         if (index >= parts.length - 1) return Promise.resolve();
//         currentPath += (index > 0 ? '/' : '') + parts[index];

//         const url = `https://api.github.com/repos/${user}/${repo}/contents/${currentPath}`;
//         return fetch(url, {
//             headers: {
//                 'Authorization': `token ${accessToken}`
//             }
//         })
//             .then(response => {
//                 if (response.status === 404) {
//                     // Directory does not exist, create it
//                     return fetch(url, {
//                         method: 'PUT',
//                         headers: {
//                             'Authorization': `token ${accessToken}`,
//                             'Content-Type': 'application/json'
//                         },
//                         body: JSON.stringify({
//                             message: `Create directory ${currentPath}`,
//                             content: '' // Empty content for directory
//                         })
//                     });
//                 }
//             })
//             .then(() => checkAndCreate(index + 1));
//     };

//     return checkAndCreate(0);
// }
function pushToGitHub(header, body) {
    const accessToken = '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';

    // Construct the URL for the GitHub API
    const url = `https://api.github.com/repos/${header.user}/${header.repo}/contents/${header.path}`;

    // First, get the current state of the file
    // ensureDirectoryExists(header.path, accessToken, header.user, header.repo)
    //     .then(() => push(body.content, body.commit))
    //     .catch(error => {
    //         console.error('Error ensuring directories:', error);
    //     });

    fetch(url, {
        headers: {
            'Authorization': `token ${accessToken}`
        }

    }).then(response => {
        if (response.status === 404) {
            // File does not exist, create it
            return { sha: null };
        } else {
            return response.json();
        }

    }).then(data => {
        // Create the request payload
        const requestData = {
            message: body.commit,
            content: btoa(body.content)
        };

        if (data.sha) {
            // If file exists, include the current SHA of the file
            requestData.sha = data.sha;
        }

        // Send a PUT request to create or update the file
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

    }).then(response => {
        return response.json()
    }).then(data => {
        console.log('File successfully created/updated on GitHub:', data);

    }).catch(error => {
        console.error('Error pushing to GitHub:', error);

    });


}



const scriptElement = document.createElement('script');
scriptElement.src = chrome.runtime.getURL('inject.js');
(document.head || document.documentElement).appendChild(scriptElement);
scriptElement.onload = () => { scriptElement.remove(); };

