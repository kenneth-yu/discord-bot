const Discord = require('discord.js');
const client = new Discord.Client();
let fs = require('fs')
let dictionary 

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

const newServerIdCheck = (channel_id) =>{
    if(!dictionary[channel_id]){
        dictionary[channel_id] = {}
    }
}

readJson()

client.once('ready', () => {
    console.log('Bot is ready!')
})

client.on('message', message => {
    let channel_id = message.channel.guild.id
    var [arg1,arg2, ...arg3] = message.content.split(' ');
    arg3 = arg3.join(' ');
    let messageArray = [arg1]
    if(arg2 !== undefined && arg2 !== ''){
        messageArray.push(arg2)
    }
    if(arg3 !== undefined && arg3 !== ''){
        messageArray.push(arg3)
    }
    console.log(messageArray)

    if(messageArray.length === 1){
        readJson()
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
            default:
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
            case '!setReminder':
                console.log(Date.now())
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
})

client.login('NjcyMjUyNDM1Njc4NDk0NzIw.XjSNWA.8dLe7G1EmSA2oq7vmxlg1RDJ8lc')