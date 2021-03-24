const fs = require('fs');
const Discord = require('discord.js');

const filter = (reaction) => {
    return reaction.emoji.name === '✔️' || reaction.emoji.name === '✅' || reaction.emoji.name === '☑️' || reaction.emoji.name === '🚫'
}

async function createReactionTracker(sentMessage, client, goingSet, nextEventDate) {
    let collector = sentMessage.createReactionCollector(filter);
    collector.on("collect", async (reaction, user) => {
        let member = await client.guilds.cache.get(process.env.SERVER_ID).members.fetch(user.id);
        console.log(`Collected ${reaction.emoji.name} from ${member.nickname}`);
        const newEmbed = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Mock Interview Session")
            .setDescription("Pair up and talk your way through interview questions!")
            .addField("Date", nextEventDate.toLocaleString() + " EST")
        sentMessage.embeds[0].fields.forEach(field => {
            if(field.name === "Going") {
                if(reaction.emoji.name === "🚫") {
                    if(field.value.includes(member.nickname)) {
                        if(field.value === member.nickname) {
                            newEmbed.addField("Going", "N/A");
                            goingSet.delete(member.nickname);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        } else {
                            newEmbed.addField("Going", field.value.replace(member.nickname + "\n", ""));
                            goingSet.delete(member.nickname);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        }
                    } else {
                        newEmbed.addField("Going", field.value)
                    }
                } else {
                    if(!field.value.includes(member.nickname)) {
                        if(field.value === "N/A") {
                            newEmbed.addField("Going", member.nickname)
                            goingSet.add(member.nickname);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        } else {
                            newEmbed.addField("Going", field.value + "\n" + member.nickname)
                            goingSet.add(member.nickname);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        }
                    }
                    else {
                        newEmbed.addField("Going", field.value)
                    }
                }
            }
        })
        sentMessage.edit(newEmbed)
    })
}

module.exports = createReactionTracker;