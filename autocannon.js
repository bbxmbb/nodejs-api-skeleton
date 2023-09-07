const autocannon = require('autocannon');

async function runAutoCannon() {
    const result = await autocannon({
        url: 'https://node.bbxmbb.com/items',
        connections: 1,
        duration: 5,
        amount: 1000,
        workers: 2,
        method: "GET",
        body: null,
        headers: {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJiYnhtYmIiLCJpYXQiOjE2OTM2Mjk0MTIsImV4cCI6MTY5NjIyMTQxMn0.wjiAWBTrmuc09-LTZ-5QAdWL9ZLqoS4mWm0Hu6FfpKQ",
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br"
        }
    });

    console.log(result);
}

runAutoCannon();