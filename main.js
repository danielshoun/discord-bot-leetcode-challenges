const Discord = require('discord.js');
const client = new Discord.Client();
const challengeGetter = require('./challenge');

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
var CronJob = require('cron').CronJob;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async (receivedMessage) => {
    if(receivedMessage.content === "/test") {
        let currentMonth = monthNumToStr[new Date().getMonth()];
        let currentYear = new Date().getFullYear();
        let currentDay = new Date().getDate();
        let messageSendAttempts = 0;
        while(messageSendAttempts < 10) {
            try {
                let challengeObj = await challengeGetter.getDailyChallenge(currentMonth, currentYear, currentDay);
                let messageToSend = `${challengeObj.questionTitle}\n${challengeObj.questionUrl}\n\n${challengeObj.questionText}`
                client.guilds.cache.get(process.env.SERVER_ID).channels.cache.get("805575527477805057").send(messageToSend);
                messageSendAttempts = 10;
            } catch(e) {
                console.log("Error sending message: ");
                console.log(e);
                messageSendAttempts++;
            }
        }
    }
})

client.login(process.env.DISCORD_TOKEN);

var job = new CronJob('0 8 * * *', async function() {
    let currentMonth = monthNumToStr[new Date().getMonth()];
    let currentYear = new Date().getFullYear();
    let currentDay = new Date().getDate();
    let messageSendAttempts = 0;
    while(messageSendAttempts < 10) {
        try {
            let challengeObj = await challengeGetter.getDailyChallenge(currentMonth, currentYear, currentDay);
            let messageToSend = `${challengeObj.questionTitle}\n${challengeObj.questionUrl}\n\n${challengeObj.questionText}`
            client.guilds.cache.get(process.env.SERVER_ID).channels.cache.get(process.env.CHANNEL_ID).send(messageToSend);
            messageSendAttempts = 10;
        } catch(e) {
            console.log("Error sending message: ");
            console.log(e);
            messageSendAttempts++;
        }
    }
}, null, true, "America/New_York");
job.start();
