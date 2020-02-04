const config =  require('./config.json'); 
const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require("node-fetch");
let fs = require('fs')
let dictionary 

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

  async function getChar(charName) {
    let url = `https://raider.io/api/v1/characters/profile?region=us&realm=sargeras&name=${charName}&fields=gear%2Cmythic_plus_scores_by_season%3Acurrent`
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

//Discord Bot---------------------------------------------------------------------------------------------------------
readJson()
client.once('ready', () => {
    console.log('Bot is ready!')
})

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
                    message.channel.send('Please use the following format: !char [character name] (Sargeras Only).')
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
                    getChar(messageArray[1]).then(res => {
                        message.channel.send(res.name)
                        message.channel.send(res.race + ' ' + res.class + ': ' + res.active_spec_name)
                        message.channel.send('Equipped ilvl is ' + res.gear.item_level_equipped + ' with cloak rank ' + res.gear.corruption.cloakRank)
                        message.channel.send('Current Raider.io score is: ' + res.mythic_plus_scores_by_season[0].scores.all)
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
            }
        }
    }
})

client.login(config.apiKey)
//Discord Bot END---------------------------------------------------------------------------------------------------------