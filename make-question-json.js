const fs = require('fs');

let questionData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

let urls = [];
questionData.stat_status_pairs.forEach(pair => {
    urls.push(`https://leetcode.com/problems/${pair.stat.question__article__slug}`);
})

let obj = {};
urls.forEach(url => {
    obj[url] = false;
})

fs.writeFileSync('questions.json', JSON.stringify(obj, null, 2));