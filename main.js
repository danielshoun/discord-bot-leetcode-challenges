const fs = require('fs');
const Discord = require('discord.js');
const challengeGetter = require('./challenge');
const createReactionTracker = require("./create-reaction-tracker");

const monthNumToStr = {
    0: "january",
    1: "february",
    2: "march",
    3: "april",
    4: "may",
    5: "june",
    6: "july",
    7: "august",
    8: "september",
    9: "october",
    10: "november",
    11: "december"
};

require('dotenv').config()
const CronJob = require('cron').CronJob;

let goingSet = new Set();

try {
    let goingJson = JSON.parse(fs.readFileSync('goingSet.json', 'utf-8'));
    goingSet = new Set(goingJson);
    console.log("goingSet.json loaded successfully.");
} catch (e) {
    console.error('Could not load goingSet.json.');
    console.error(e);
}

let currentMessageId;
let currentMessageChannel;
let nextEventDate;

try {
    let messageData = JSON.parse(fs.readFileSync('messageData.json', 'utf-8'));
    currentMessageId = messageData.id;
    currentMessageChannel = messageData.channel;
    nextEventDate = messageData.date;
    console.log("messageData.json loaded successfully.")
} catch (e) {
    console.error('Could not load messageData.json.');
    console.error(e);
}

let questionsJson;

try {
    questionsJson = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));
    Object.keys(questionsJson).forEach(key => {
        if(questionsJson[key]) {
            delete questionsJson[key]
        }
    })
    console.log('questions.json loaded successfully.');
} catch (e) {
    console.error('Could not load questions.json')
    console.error(e);
}

const client = new Discord.Client();
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    if(currentMessageId) {
        client.guilds.cache.get(process.env.SERVER_ID).channels.cache.get(currentMessageChannel).messages.fetch(currentMessageId)
            .then(async sentMessage => {
                let collector = await createReactionTracker(sentMessage, client, goingSet, nextEventDate);
                console.log(`Reaction tracker created for message with ID ${currentMessageId}`);
            });
    }
});

client.on('message', async (receivedMessage) => {
    // if(receivedMessage.content === "/test") {
    //     goingSet = new Set();
    //     fs.writeFile('goingSet.json', '[]', () => console.log("goingSet.json reset."));
    //     nextEventDate = new Date(new Date().getTime() + 432000000);
    //     const messageEmbed = new Discord.MessageEmbed()
    //         .setColor("#FF0000")
    //         .setTitle("Mock Interview Session")
    //         .setDescription("Pair up and talk your way through interview questions!")
    //         .addFields(
    //             {name: "Date", value: nextEventDate.toLocaleString() + " EST"},
    //             {name: "Going", value: "N/A"}
    //         )
    //     let sentMessage = await client.guilds.cache.get(process.env.SERVER_ID).channels.cache.get("805575527477805057").send(messageEmbed);
    //     let messageData = {id: sentMessage.id, channel: "805575527477805057", date: nextEventDate}
    //     fs.writeFile('messageData.json', JSON.stringify(messageData), () => console.log("messageData.json written."))
    //
    //     await createReactionTracker(sentMessage, client, goingSet, nextEventDate);
    // }
})

client.login(process.env.DISCORD_TOKEN);

const challengePostingJob = new CronJob('0 8 * * *', async function () {
    let currentMonth = monthNumToStr[new Date().getMonth()];
    let currentYear = new Date().getFullYear();
    let currentDay = new Date().getDate();
    let messageSendAttempts = 0;
    while (messageSendAttempts < 10) {
        try {
            let challengeObj = await challengeGetter.getDailyChallenge(currentMonth, currentYear, currentDay);
            let messageToSend = `${challengeObj.questionTitle}\n${challengeObj.questionUrl}\n\n${challengeObj.questionText}`
            client.guilds.cache.get(process.env.SERVER_ID).channels.cache.get(process.env.CHALLENGE_CHANNEL_ID).send(messageToSend);
            messageSendAttempts = 10;
        } catch (e) {
            console.log("Error sending message: ");
            console.log(e);
            messageSendAttempts++;
        }
    }
}, null, true, "America/New_York");
challengePostingJob.start();

const interviewPostingJob = new CronJob('30 14 * * 3', async function () {
    goingSet = new Set();
    fs.writeFile('goingSet.json', '[]', () => console.log("goingSet.json reset."));
    nextEventDate = new Date(new Date().getTime() + 432000000);
    const messageEmbed = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Mock Interview Session")
        .setDescription("Pair up and talk your way through interview questions!")
        .addFields(
            {name: "Date", value: nextEventDate.toLocaleString() + " EST"},
            {name: "Going", value: "N/A"}
        )
    let sentMessage = await client.guilds.cache.get(process.env.SERVER_ID).channels.cache.get("799428918734094346").send(messageEmbed);
    let messageData = {id: sentMessage.id, channel: "799428918734094346", date: nextEventDate}
    fs.writeFile('messageData.json', JSON.stringify(messageData), () => console.log("messageData.json written."))

    let collector = await createReactionTracker(sentMessage, client, goingSet, nextEventDate);
}, null, true, "America/New_York")
interviewPostingJob.start();

const interviewEventJob = new CronJob('30 14 * * 0', async function () {
    let goingArr = Array.from(goingSet);
    let pairs = {}
    let lonelyPerson;
    while (goingArr.length > 0) {
        if(goingArr.length > 1) {
            const randomPerson1 = goingArr[Math.floor(Math.random() * goingArr.length)];
            goingArr.splice(goingArr.indexOf(randomPerson1), 1);
            const randomPerson2 = goingArr[Math.floor(Math.random() * goingArr.length)];
            goingArr.splice(goingArr.indexOf(randomPerson2), 1);
            pairs[randomPerson1] = randomPerson2;
        } else {
            lonelyPerson = goingArr.pop();
        }
    }
    let questionUrlKeys = Object.keys(questionsJson);
    let questionUrl1 = questionUrlKeys[questionUrlKeys.length * Math.random() << 0]
    let questionUrl2 = questionUrlKeys[questionUrlKeys.length * Math.random() << 0]

    let message = `Suggested LeetCode Questions\n${questionUrl1}\n${questionUrl2}\n\nPairs\n`;
    Object.entries(pairs).forEach(entry => {
        let [person1, person2] = entry;
        message += `${person1} & ${person2}\n`;
    })
})
interviewEventJob.start();