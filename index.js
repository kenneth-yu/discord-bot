const config =  require('./config.json'); 
const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require("node-fetch");
const schedule = require('node-schedule');
let fs = require('fs')
let dictionary 
let daylightSavings = false;

client.on('error', (err) => {
    console.log(err.message)
 });

//JSON Read/Write --------------------------------------------------------------------------------------------
const readJson = () => {
    fs.readFile('./dictionary.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            return
        }
        try {
            if(dictionary){
                dictionary = JSON.parse(jsonString)
                console.log("JSON file was read successfully and dictionary has been updated")
            }
            else{
                dictionary = JSON.parse(jsonString)
                console.log("JSON file was read successfully and dictionary is setting for the first time")
            }
        } 
        catch(err) {
            writeJson({})
            console.log("JSON file was empty. Empty JSON object was added")
        }
    })
}

const writeJson = (newDictionary) => {
    fs.writeFile('./dictionary.json', JSON.stringify(newDictionary, null, 2), (err) => {
        if (err) console.log('Error writing file:', err)
    })
}

//JSON Read/Write END --------------------------------------------------------------------------------------------

//Helper Functions -----------------------------------------------------------------------------------------------
const newServerIdCheck = (channel_id) => {
    if(!dictionary[channel_id]){
        dictionary[channel_id] = {}
    }
}

const argCompiler = (messageArray, arg2, arg3) => {
    if(arg2 !== undefined && arg2 !== ''){
        messageArray.push(arg2)
    }
    if(arg3 !== undefined && arg3 !== ''){
        messageArray.push(arg3)
    }
    console.log(messageArray)
}
//Helper Functions END -----------------------------------------------------------------------------------------------

//Raider.io Fetch ---------------------------------------------------------------------------------------------
async function getAffixes() {
    let url = 'https://raider.io/api/v1/mythic-plus/affixes?region=us&locale=en'
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }

  async function getChar(charName, realm = "sargeras") {
    let url = `https://raider.io/api/v1/characters/profile?region=us&realm=${realm}&name=${charName}&fields=gear%2Cmythic_plus_scores_by_season%3Acurrent`
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }
  
//Raider.io END -----------------------------------------------------------------------------------------------

//WowProgress Fetch -------------------------------------------------------------------------------------------
async function getRank() {
    let url = `https://www.wowprogress.com/guild/us/sargeras/Grand+Central+Parkway/json_rank`
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  }
//WowProgress Fetch END -------------------------------------------------------------------------------------------

//Discord Bot---------------------------------------------------------------------------------------------------------
readJson()
client.once('ready', () => {
    console.log('Bot is ready!')
})

//remember that node-scheduler uses GMT/UTC
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(4, 5)];
rule.hour =  daylightSavings ? 0 : 1;
rule.minute = 0;

//By default schedule warcraft log reminders
schedule.scheduleJob("warcraftlogs reminder", rule, function(){
    client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
}); 

client.on('message', message => {
    if(message.content[0] === '!'){
        let channel_id = message.channel.guild.id
        var [arg1,arg2, ...arg3] = message.content.split(' ');
        arg3 = arg3.join(' ');
        let messageArray = [arg1]
        argCompiler(messageArray, arg2, arg3)
        
        if(messageArray.length === 1){
            newServerIdCheck(channel_id)
            switch (message.content){
                // case '!test':
                //     message.channel.send("waiting for first reply");
                //     const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
                //     collector.on('collect', message => {
                //             console.log(message.content)
                //             let something = [...collector.collected.keys()]
                //             console.log(something)
                //             if(something.length === 1){
                //                 message.channel.send("first message received")
                //             }
                //             else if(something.length === 2){
                //                 message.channel.send("second message received")
                //                 console.log(typeof something[0])
                //                 console.log(collector.collectedg)
                //             }
                //     })
                //     break;
                case '!help':
                    message.channel.send("Hi, I can do accept keywords using !newKeyword, as well as !editKeyword and !deleteKeyword.")
                    break;
                case '!newKeyword':
                    //!newKeyword [key] [value]
                    message.channel.send('Please use the following format: !newKeyword [keyword here] [corresponding value here].')
                    break;
                case '!editKeyword':
                    message.channel.send('Please use the following format: !editKeyword [keyword here] [updated value here].')
                    break;
                case '!deleteKeyword':
                    message.channel.send('Please use the following format: !deleteKeyword [the keyword you want to delete here].')
                    break;
                case '!affixes':
                    getAffixes().then(res => {
                        message.channel.send('The current Mythic+ Affixes are ' + res.title + '.')
                    })
                    break;
                case '!affixDetails':
                    getAffixes().then(res => {
                        res.affix_details.forEach(affix => {
                            message.channel.send(affix.name + ' : ' + affix.description)
                        })
                    })
                    break;
                case '!char':
                    message.channel.send('Please use the following format: !char [character name] [optional realm].')
                    break;
                case '!guildRank':
                    getRank().then(res => {
                        message.channel.send('Grand Central Parkway is currently rank ' + res.realm_rank +' on Sargeras and ' + res.world_rank + ' in the world.')
                    })
                    break;
                case '!setReminder':
                    // message.channel.send('Please use the format: !setReminder [time (24 hour time)] [date (optional)]')
                    break;
                case '!enableLogReminder':
                    if(schedule.scheduledJobs["warcraftlogs reminder"]){
                        message.channel.send('WarcraftLog Reminder is already scheduled!')
                    }
                    else{
                        schedule.scheduleJob("warcraftlogs reminder", rule, function(){
                            client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
                        }); 
                        if(schedule.scheduledJobs["warcraftlogs reminder"]){
                            message.channel.send('WarcraftLog Reminder successfully scheduled!')
                        }
                    }
                    break;
                case '!disableLogReminder':
                    if(schedule.scheduledJobs["warcraftlogs reminder"]){
                        schedule.scheduledJobs["warcraftlogs reminder"].cancel()
                        if(!schedule.scheduledJobs["warcraftlogs reminder"]){
                            message.channel.send('WarcraftLog reminder is cancelled!')
                        }
                        else{
                            message.channel.send("Failed to cancel WarcraftLog Reminder!")
                        }
                    }
                    else{
                        message.channel.send("Warcraftlog reminder has already been disabled!")
                    }
                    break;
                case '!daylightSavings':
                    message.channel.send(`Daylight Savings is currently ${daylightSavings ? "on" : "off"}`)
                    break;
                case '!daylightSavingsOn':
                    if(daylightSavings){
                        message.channel.send("Daylight Savings is already on")
                    }
                    else{
                        daylightSavings = true
                        message.channel.send(`Daylight Savings is has been set to ${daylightSavings ? "on" : "off"}`)
                        if(schedule.scheduledJobs["warcraftlogs reminder"]){
                            schedule.scheduledJobs["warcraftlogs reminder"].cancel()
                            schedule.scheduleJob("warcraftlogs reminder", rule, function(){
                                client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
                            }); 
                            if(schedule.scheduledJobs["warcraftlogs reminder"]){
                                message.channel.send('WarcraftLog Reminder successfully scheduled!')
                            }
                        }
                    }
                    break;
                case '!daylightSavingsOff':
                    if(!daylightSavings){
                        message.channel.send("Daylight Savings is already off")
                    }
                    else{
                       daylightSavings = false
                       message.channel.send(`Daylight Savings is has been set to ${daylightSavings ? "on" : "off"}`)
                       if(schedule.scheduledJobs["warcraftlogs reminder"]){
                            schedule.scheduledJobs["warcraftlogs reminder"].cancel()
                            schedule.scheduleJob("warcraftlogs reminder", rule, function(){
                                client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
                        }); 
                            if(schedule.scheduledJobs["warcraftlogs reminder"]){
                                message.channel.send('WarcraftLog Reminder successfully scheduled!')
                            }
                        }
                    }
                    break;
                default:
                    readJson()
                    if(dictionary[channel_id][message.content]){
                        message.channel.send(dictionary[channel_id][message.content])
                    }
                    break;
            }
        }
        if(messageArray.length === 2){
            readJson()
            newServerIdCheck(channel_id)
            switch(messageArray[0]){
                case '!newKeyword':
                    message.channel.send('Please use the following format: !newKeyword [keyword here] [corresponding value here].')
                    break;
                case '!editKeyword':
                    message.channel.send('Please use the following format: !editKeyword [keyword here] [updated value here].')
                    break;
                case '!deleteKeyword':
                    if(dictionary[channel_id][messageArray[1]]){
                        delete dictionary[channel_id][messageArray[1]]
                        writeJson(dictionary)
                        message.channel.send("Keyword has been removed from the database!")
                    }
                    else{
                        message.channel.send("That keyword could not be found in the database.")
                    }
                    break;
                case '!char':
                    console.log("two args")
                    getChar(messageArray[1]).then(res => {
                        if(res.statusCode === 400){
                            message.channel.send("YOU DONE FUCKED UP A A RON. Character doesn't exist!")
                        }
                        else{
                            message.channel.send(res.name + ' - ' + res.realm)
                            message.channel.send(res.race + ' ' + res.class + ': ' + res.active_spec_name)
                            message.channel.send('Equipped ilvl is ' + res.gear.item_level_equipped + ' with cloak rank ' + res.gear.corruption.cloakRank)
                            message.channel.send('Current Raider.io score is ' + res.mythic_plus_scores_by_season[0].scores.all)
                        }
                    })
                    break;
                case '!setReminder':
                    //!setReminder [what] [when (optional)]

                    // let today = new Date();
                    // let date = (today.getMonth()+1) +'-'+ today.getDate() +'-'+ today.getFullYear()
                    // console.log(date)
                    message.channel.send("This is currently in development :)")

                    break;
            }
        }
        if(messageArray.length === 3){
            readJson()
            newServerIdCheck(channel_id)
            switch(messageArray[0]){
                case '!newKeyword':
                    if(messageArray[1][0] !== '!'){
                        message.channel.send("Please start the new keyword with '!' ")
                    }
                    else{
                        if(dictionary[channel_id][messageArray[1]]){
                            message.channel.send("Keyword is already in use! Please try another keyword or use '!editKeyword' to modify an existing entry.")
                        }
                        else{
                            dictionary[channel_id][messageArray[1]] = messageArray[2]
                            writeJson(dictionary)
                            message.channel.send("Keyword has been added to the database!")
                        }
                    }
                    break;
                case '!editKeyword':
                    if(messageArray[1][0] !== '!'){
                        message.channel.send("Please start the new keyword with '!' ")
                    }
                    else{
                        if(dictionary[channel_id][messageArray[1]]){
                            dictionary[channel_id][messageArray[1]] = messageArray[2]
                            writeJson(dictionary)
                            message.channel.send("Keyword has been updated!")
                        }
                        else{
                            message.channel.send("That keyword could not be found in the database.")
                        }
                    }
                    break;
                case '!char':
                    console.log('3 args')
                    getChar(messageArray[1], messageArray[2]).then(res => {
                        console.log(res)
                        if(res.statusCode === 400){
                            message.channel.send("YOU DONE FUCKED UP A A RON. Character doesn't exist!")
                        }
                        else{
                            message.channel.send(res.name + ' - ' + res.realm)
                            message.channel.send(res.race + ' ' + res.class + ': ' + res.active_spec_name)
                            message.channel.send('Equipped ilvl is ' + res.gear.item_level_equipped + ' with cloak rank ' + res.gear.corruption.cloakRank)
                            message.channel.send('Current Raider.io score is ' + res.mythic_plus_scores_by_season[0].scores.all)
                        }
                    })
                    break;
            }
        }
    }
})

client.login(config.apiKey)
//Discord Bot END---------------------------------------------------------------------------------------------------------