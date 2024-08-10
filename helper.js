const fs = require('fs')
const fetchHelper = require('./fetchHelper.js')
const config =  require('./config.json'); 
var BNET_ID = config.BNET_ID
var BNET_SECRET = config.BNET_SECRET

//JSON Read/Write --------------------------------------------------------------------------------------------
const readJson = () => {
    let dictionary
    try{
        dictionary = JSON.parse(fs.readFileSync('./dictionary.json', 'utf8'))
        if(dictionary){
            console.log("JSON file was read successfully")
        }
    }
    catch(err){
        writeJson({})
        console.log("JSON file was empty. Empty JSON object was added")
    }
    return dictionary
}

const writeJson = (newDictionary) => {
    fs.writeFile('./dictionary.json', JSON.stringify(newDictionary, null, 2), (err) => {
        if (err) console.log('Error writing file:', err)
    })
}

//JSON Read/Write END --------------------------------------------------------------------------------------------

//Helper Functions -----------------------------------------------------------------------------------------------
const newServerIdCheck = (dictionary, channel_id) => {
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

const timeUntilRaid = (nextRaid) => {
    let now = new Date()
    let timeDiff = nextRaid - now
    let ms = Math.ceil((timeDiff)/1000)*1000;
    let d =  ms / 8.64e7 | 0;
    let h = (ms % 8.64e7) / 3.6e6 | 0;
    let m = (ms % 3.6e6)  / 6e4 | 0;
    let s = (ms % 6e4)    / 1e3 | 0;

    let days = d === 0 ? "" : `${d} Days, `
    let hours = d === 0 && h === 0 ? "" : `${h} Hours, `
    let minutes = d === 0 && h === 0 && m === 0 ? "" : `${m} Minutes, `
    return `Our next raid is in ${days}${hours}${minutes}and ${s} Seconds.`
  }

const rescheduleWclReminder = (schedule, rule, client, message) => {
    if(schedule.scheduledJobs["warcraftlogs reminder"]){
        schedule.scheduledJobs["warcraftlogs reminder"].cancel()
       let newLogReminder = schedule.scheduleJob("warcraftlogs reminder", rule, function(){
            client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
    });
        if(schedule.scheduledJobs["warcraftlogs reminder"]){
            message.channel.send('WarcraftLog Reminder successfully scheduled!')
        }
        return newLogReminder
    }
}

const serverStatusHelper = (interaction, serverStatusPing, addGuildie)=> {
    if(addGuildie){
        serverStatusPing[addGuildie] = addGuildie
        interaction.reply(`<@${addGuildie}> will be pinged when the server is up!`)
    }
    else{
        serverStatusPing[interaction.user.id] = interaction.user.id
        interaction.reply(`I'll ping you when the server is up!`)
    }
}

const recurisveStatusChecker = (interaction, serverStatusPing, client, addGuildie) => {
    let generalChannel = client.channels.cache.get(`678287236239982593`);
    let serverStatusChecker = (firstCall = true) => {
        fetchHelper.createAccessToken(BNET_ID, BNET_SECRET, region = 'us').then(res => {
            fetchHelper.getRealmStatus(res.access_token).then(res => {
                if(res.status.type === 'UP'){
                    if(Object.keys(serverStatusPing).length){
                        let userString = ''
                        Object.keys(serverStatusPing).forEach(user => {
                            userString += `<@${user}> `
                            delete serverStatusPing[user]
                        })
                        interaction.reply({content: 'Status sent in general chat', ephemeral: true})
                        generalChannel.send`${userString}Sargeras is up! :white_check_mark:`()
                    }
                    else{

                        interaction.reply(`Sargeras is up! :white_check_mark:`)
                    }
                }
                else{
                    if(firstCall === true){
                        interaction.reply('Sargeras is down  :x:')
                        if(serverStatusPing[addGuildie]){
                            interaction.reply("They are already signed up for a ping when Sargeras comes online.")
                        }
                        else if (serverStatusPing[interaction.author.id] && !addGuildie){
                            interaction.reply("You're already signed up for a ping when Sargeras comes online.")
                        }
                        else{
                            if(Object.keys(serverStatusPing).length > 0){
                                //Someone has already started serverStatusChecker
                                serverStatusHelper(interaction, serverStatusPing, addGuildie)
                            }else{
                                //Nobody has started serverStatusChecker
                                serverStatusHelper(interaction, serverStatusPing, addGuildie)
                                setTimeout(() => serverStatusChecker(false), 45000)
                            }
                        }
                    }
                    else{
                        //Recursive call that ends when server is 'UP'
                        setTimeout(() => serverStatusChecker(false), 45000)
                    }
                }
            })
        })
    }
    serverStatusChecker()
}


const testStatusChecker = (message, serverStatusPing) => {
    let userString = ''
    Object.keys(serverStatusPing).forEach(user => {
        userString += `<@${user}> `
        delete serverStatusPing[user]
    })
    message.channel.send(`${userString}Sargeras is up! :white_check_mark:`)
    console.log(serverStatusPing, "inside function")
}

//Helper Functions END -----------------------------------------------------------------------------------------------



exports.readJson = readJson;
exports.writeJson = writeJson;
exports.newServerIdCheck = newServerIdCheck;
exports.argCompiler = argCompiler;
exports.timeUntilRaid = timeUntilRaid;
exports.rescheduleWclReminder = rescheduleWclReminder;
exports.recurisveStatusChecker = recurisveStatusChecker;