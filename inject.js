var questionId = 0,
    questionTitle = '',
    questionTitleSlug = '',
    questionContent = '',
    questionDifficulty = '',
    questionlink = window.location.href;

(function () {
    var originalOpen = XMLHttpRequest.prototype.open;
    var response = '';

    XMLHttpRequest.prototype.open = function () {
        this.addEventListener('readystatechange', function () {
            if (this.readyState === 4 && this.responseURL.includes('https://leetcode.com/graphql/')) {
                try {
                    if (this.responseType === 'blob') {
                        var reader = new FileReader();
                        reader.onload = () => {
                            response = JSON.parse(reader.result);
                            logResponse(response);
                        };
                        reader.readAsText(this.response);
                    } else {
                        response = JSON.parse(this.responseText);
                        logResponse(response);
                    }
                } catch (error) {
                    console.error("Error parsing response:", error);
                }
            }
        }, false);

        originalOpen.apply(this, arguments);
    };

    function logResponse(response) {
        if (response && response.data) {
            // console.log('data:');
            console.log(response.data);

            if (response.data.question) {
                if (!questionId && response.data.question.questionId) {
                    questionId = response.data.question.questionId;
                    console.log('questionId' + questionId,);
                }

                if (!questionTitle && response.data.question.title) {
                    questionTitle = response.data.question.title;
                    console.log('questionTitle' + questionTitle,);
                }

                if (!questionTitleSlug && response.data.question.titleSlug) {
                    questionTitleSlug = response.data.question.titleSlug;
                    console.log('questionTitleSlug' + questionTitleSlug,);
                }

                if (!questionContent && response.data.question.content) {
                    questionContent = response.data.question.content;
                    console.log('questionContent' + questionContent,);
                }

                if (!questionDifficulty && response.data.question.difficulty) {
                    questionDifficulty = response.data.question.difficulty;
                    console.log('questionDifficulty' + questionDifficulty,);
                }
            }

            if (response.data.submissionDetails) {
                console.log(response.data.submissionDetails.code);
                let data_SUBMISSION_DETAILS = {
                    'questionId': questionId,
                    'questionTitle': questionTitle,
                    'questionTitleSlug': questionTitleSlug,
                    'questionDifficulty': questionDifficulty,
                    'questionlink': questionlink,
                    ...response
                }

                let data_QUESTION = {
                    'questionId': questionId,
                    'questionTitle': questionTitle,
                    'questionTitleSlug': questionTitleSlug,
                    'questionDifficulty': questionDifficulty,
                    'questionlink': questionlink,
                    'data': {
                        'question': {
                            'content': questionContent,
                        }
                    }
                }

                window.postMessage({ type: "SUBMISSION_DETAILS", payload: data_SUBMISSION_DETAILS }, "*");
                window.postMessage({ type: "QUESTION", payload: data_QUESTION }, "*");
            }
        }
    }
})();