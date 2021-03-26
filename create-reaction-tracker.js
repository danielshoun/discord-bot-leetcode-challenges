const fs = require('fs');
const Discord = require('discord.js');

const filter = (reaction) => {
    return reaction.emoji.name === '✔️' || reaction.emoji.name === '✅' || reaction.emoji.name === '☑️' || reaction.emoji.name === '🚫'
}

async function createReactionTracker(sentMessage, client, goingSet, nextEventDate) {
    let collector = sentMessage.createReactionCollector(filter);
    collector.on("collect", async (reaction, user) => {
        let member = await client.guilds.cache.get(process.env.SERVER_ID).members.fetch(user.id);
        console.log(`Collected ${reaction.emoji.name} from ${member.displayName}`);
        const newEmbed = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Mock Interview Session")
            .setDescription("Pair up and talk your way through interview questions!")
            .addField("Date", nextEventDate.toLocaleString() + " EST")
        sentMessage.embeds[0].fields.forEach(field => {
            if(field.name === "Going") {
                if(reaction.emoji.name === "🚫") {
                    if(field.value.includes(member.displayName)) {
                        if(field.value === member.displayName) {
                            newEmbed.addField("Going", "N/A");
                            goingSet.delete(member.displayName);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        } else {
                            newEmbed.addField("Going", field.value.replace(member.displayName + "\n", ""));
                            goingSet.delete(member.displayName);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        }
                    } else {
                        newEmbed.addField("Going", field.value)
                    }
                } else {
                    if(!field.value.includes(member.displayName)) {
                        if(field.value === "N/A") {
                            newEmbed.addField("Going", member.displayName)
                            goingSet.add(member.displayName);
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        } else {
                            newEmbed.addField("Going", field.value + "\n" + member.displayName)
                            goingSet.add(member.displayName);
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
        let editedMessage = await sentMessage.edit(newEmbed)
        console.log(editedMessage);
    })

    return collector
}

module.exports = createReactionTracker;