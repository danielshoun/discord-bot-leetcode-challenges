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
                            goingSet.delete(member.displayName);
                            console.log(`goingSet: ${goingSet}`);
                            newEmbed.addField("Going", "N/A");
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        } else {
                            goingSet.delete(member.displayName);
                            console.log(`goingSet: ${goingSet}`);
                            let newGoingString = "";
                            Array.from(goingSet).forEach(name => {
                                newGoingString += `${name}\n`;
                            });
                            newEmbed.addField("Going", newGoingString);
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
                            goingSet.add(member.displayName);
                            console.log(`goingSet: ${goingSet}`);
                            newEmbed.addField("Going", member.displayName)
                            fs.writeFile('goingSet.json', JSON.stringify(Array.from(goingSet)), () => {
                                console.log("Updated goingSet.json file.")
                            });
                        } else {
                            goingSet.add(member.displayName);
                            console.log(`goingSet: ${goingSet}`);
                            let newGoingString = "";
                            Array.from(goingSet).forEach(name => {
                                newGoingString += `${name}\n`;
                            });
                            newEmbed.addField("Going", newGoingString);
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
        console.log(JSON.stringify(newEmbed.fields, null, 2));
        let editedMessage = await sentMessage.edit(newEmbed)
    })
    collector.on('end', collected => {
        console.log("Collector has finished.")
    })
    return collector
}

module.exports = createReactionTracker;