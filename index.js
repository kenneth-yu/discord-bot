const config =  require('./config.json'); 
const Discord = require('discord.js');
const client = new Discord.Client();
const schedule = require('node-schedule');
const moment = require('moment');
const helper = require('./helper.js')
const fetchHelper = require('./fetchHelper.js')

// var BNET_ID = config.BNET_ID
// var BNET_SECRET = config.BNET_SECRET

let fs = require('fs')
let dictionary 
let serverStatusPing = {};
let daylightSavings = (new Date().getTimezoneOffset() / 60) === 5 ? true : false
let raidScheduled = true;

client.on('error', (err) => {
    console.log(err.message)
});

// JSON Read/Write --------------------------------------------------------------------------------------------
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

//Discord Bot---------------------------------------------------------------------------------------------------------
readJson()
client.once('ready', () => {
    console.log('Bot is ready!')
})

//remember that node-scheduler uses GMT/UTC
//9:00PM EST is 02:00 UTC w/o Daylight Savings - 5 Hour Difference
//9:00PM EST is 01:00 UTC w/ Daylight Savings - 4 Hour Difference
//Warcraft Log Reminder -------------------------------------------------------------------------------------------------------
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(3, 4)];
rule.hour =  21;
rule.minute = 0;

//By default schedule warcraft log reminders
let wcLogReminder;
wcLogReminder = schedule.scheduleJob("warcraftlogs reminder", rule, function(){
    client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
}); 
//Warcraft Log Reminder END -------------------------------------------------------------------------------------------------------
//Check Daylight Savings ----------------------------------------------------------------------------------------------------------
var checkDstRule = new schedule.RecurrenceRule();
checkDstRule.hour = 8;
checkDstRule.minute = 0;

schedule.scheduleJob("check daylight savings status", checkDstRule, function(){
    let botTestingChannel = client.channels.get(`678287236239982593`)
    // botTestingChannel.send('Daylight Savings Status was automatically checked.')
    newDaylightSavings = (new Date().getTimezoneOffset() / 60) === 5 ? true : false
    if(daylightSavings !== newDaylightSavings){
        botTestingChannel.send('Daylight Savings Status was automatically checked.')
        botTestingChannel.send(`<@169835135804506112> Daylight Savings was ${daylightSavings=== true ? 'on' : 'off'} and has been updated to ${newDaylightSavings === true ? 'on' : 'off'}`)
        daylightSavings = newDaylightSavings
        wcLogReminder = helper.rescheduleWclReminder(schedule, rule, client, message)
    }
    else{
        // botTestingChannel.send(`Daylight Savings is already ${daylightSavings === true ? 'on' : 'off'}. No changes are necessary.`)
    }
})
//Check Daylight Savings END ---------------------------------------------------------------------------------------------------------

client.on('message', message => {
    // Parse DMs -------------------------------------------------------------------------------------------------------------------------
    if(message.channel.type === 'dm'){
        let suggestion_box_id = '459125119906873345' //suggestion-box channel id
        let general_id = '453697747930054658' //general channel id
        var [arg1, ...arg2] = message.content.split(' ')
        console.log(arg2)
        arg2 = arg2.join(' ')
        let messageArray = [arg1]
        helper.argCompiler(messageArray, arg2)

        if(messageArray.length === 1){
            switch(messageArray[0]){
                case '!suggest':
                    message.channel.send('Please use the following format to send an anonymous suggestion: !suggest [your message here]')
                    break;
            }
        }
        if(messageArray.length === 2){
            switch(messageArray[0]){
                case '!suggest':
                    client.channels.get(suggestion_box_id).send(messageArray[1]);
                    message.channel.send("Message sent successfully!")
                    break;
                case '!talkShit':
                    if(message.author.id === '733143023797534820' || message.author.id === '169835135804506112'){
                        client.channels.get(general_id).send(messageArray[1]);
                       message.channel.send("Message sent successfully!")
                    }
                    break;
            }
        }
    // Parse DMs END -------------------------------------------------------------------------------------------------------------------------   
    }else{
        // Parse Discord Channels ------------------------------------------------------------------------------------------------------------
        if(message.content[0] === '!'){
            let channelId = message.channel.guild.id
            var [arg1,arg2, ...arg3] = message.content.split(' ');
            arg3 = arg3.join(' ');
            let messageArray = [arg1]
            helper.argCompiler(messageArray, arg2, arg3)
            
            if(messageArray.length === 1){
                helper.newServerIdCheck(dictionary, channelId)
                switch (message.content.toLowerCase()){
                    case '!suggest':
                        message.channel.send("You can send an anonymous message to the suggestion-box channel by direct messaging me !suggest [your message here]")
                        break;
                    case '!help':
                        message.channel.send("Hi, I can do accept keywords using !newKeyword, as well as !editKeyword and !deleteKeyword.")
                        break;
                    case '!newkeyword':
                        //!newKeyword [key] [value]
                        message.channel.send('Please use the following format: !newKeyword [keyword here] [corresponding value here].')
                        break;
                    case '!editkeyword':
                        message.channel.send('Please use the following format: !editKeyword [keyword here] [updated value here].')
                        break;
                    case '!deletekeyword':
                        message.channel.send('Please use the following format: !deleteKeyword [the keyword you want to delete here].')
                        break;
                    case '!affixes':
                        fetchHelper.getAffixes().then(res => {
                            message.channel.send('The current Mythic+ Affixes are ' + res.title + '.')
                        })
                        break;
                    case '!affixdetails':
                        fetchHelper.getAffixes().then(res => {
                            res.affix_details.forEach(affix => {
                                message.channel.send(affix.name + ' : ' + affix.description)
                            })
                        })
                        break;
                    case '!char':
                        message.channel.send('Please use the following format: !char [character name] [optional realm].')
                        break;
                    case '!guildrank':
                        fetchHelper.getRank().then(res => {
                            message.channel.send('Grand Central Parkway is currently rank ' + res.realm_rank +' on Sargeras and ' + res.world_rank + ' in the world.')
                        })
                        break;
                    case '!setreminder':
                        // message.channel.send('Please use the format: !setReminder [time (24 hour time)] [date (optional)]')
                        break;
                    case '!nextlogreminder': 
                        message.channel.send(wcLogReminder.pendingInvocations[0].job.nextInvocation().toDate().toLocaleString())
                        break;
                    case '!enablelogreminder':
                        if(schedule.scheduledJobs["warcraftlogs reminder"]){
                            message.channel.send('WarcraftLog Reminder is already scheduled!')
                        }
                        else{
                            wcLogReminder = schedule.scheduleJob("warcraftlogs reminder", rule, function(){
                                client.channels.get(`648974529217036310`).send("Reminder: " + `<@&453698550174318623> Don't forget to set up WarcraftLogs!`)
                            }); 
                            if(schedule.scheduledJobs["warcraftlogs reminder"]){
                                message.channel.send('WarcraftLog Reminder successfully scheduled!')
                            }
                        }
                        break;
                    case '!disablelogreminder':
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
                    case '!dst':
                        message.channel.send(`Daylight Savings is currently ${daylightSavings ? "on" : "off"}`)
                        break;
                    case '!checkdst':
                        newDaylightSavings = (new Date().getTimezoneOffset() / 60) === 5 ? true : false
                        if(daylightSavings !== newDaylightSavings){
                            message.channel.send(`Daylight Savings was ${daylightSavings} and has been updated to ${daylightSavings === true ? 'on' : 'off'}`)
                            daylightSavings = newDaylightSavings
                            helper.rescheduleWclReminder(schedule, rule, client, message)
                        }
                        else{
                            message.channel.send(`Daylight Savings is already ${daylightSavings === true ? 'on' : 'off'}. No changes are necessary.`)
                        }
                        break;
                    case '!dston':
                        //manually override daylight savings to on
                        if(daylightSavings){
                            message.channel.send("Daylight Savings is already on")
                        }
                        else{
                            daylightSavings = true
                            message.channel.send(`Daylight Savings has been set to ${daylightSavings ? "on" : "off"}`)
                            wcLogReminder = helper.rescheduleWclReminder(schedule, rule, client, message)
                        }
                        break;
                    case '!dstoff':
                        //manually override daylight savings to off
                        if(!daylightSavings){
                            message.channel.send("Daylight Savings is already off")
                        }
                        else{
                           daylightSavings = false
                           message.channel.send(`Daylight Savings has been set to ${daylightSavings ? "on" : "off"}`)
                           wcLogReminder = helper.rescheduleWclReminder(schedule, rule, client, message)
                        }
                        break;
                    case '!time':
                        message.channel.send(`It is currently ${moment().utcOffset(daylightSavings ? -5 : -4).format('LT')} EST`)
                        break;
                    case '!date': 
                        message.channel.send(moment().utcOffset(daylightSavings ? -5 : -4).format('LL'))
                        break;
                    case '!nextraid':
                        let nextRaid = wcLogReminder.pendingInvocations[0].job.nextInvocation().toDate()
                        schedule.scheduledJobs["warcraftlogs reminder"] ? 
                        message.channel.send(helper.timeUntilRaid(nextRaid)) : 
                        message.channel.send("Seems like there is no recurring raid scheduled :slight_frown: See you when new content drops!")
                        break;
                    // case '!nextraidtoggle':
                    //     raidScheduled ? message.channel.send("recurring !nextRaid is now off") : message.channel.send("recurring !nextRaid is now on")
                    //     raidScheduled = !raidScheduled
                    //     break;
                    case '!serverstatus':
                        helper.recurisveStatusChecker(message, serverStatusPing)
                        break;
                    case '!pinglist':
                        let pingList = ''
                        if(Object.keys(serverStatusPing).length > 0){
                            Object.keys(serverStatusPing).forEach( guildie => pingList += `${guildie} `)
                            message.channel.send(pingList)
                        }else{
                            message.channel.send("Ping list is empty.")
                        }
                        break;
                    case '!clearpinglist':
                        // helper.testStatusChecker(message, serverStatusPing)
                        // console.log(serverStatusPing)
                        break;
                    default:
                        readJson()
                        if(dictionary[channelId][message.content]){
                            message.channel.send(dictionary[channelId][message.content])
                        }
                        break;
                }
            }
            if(messageArray.length === 2){
                let channelId = message.channel.guild.id
                readJson()
                helper.newServerIdCheck(dictionary, channelId)
                switch(messageArray[0].toLowerCase()){
                    case '!newkeyword':
                        message.channel.send('Please use the following format: !newKeyword [keyword here] [corresponding value here].')
                        break;
                    case '!editkeyword':
                        message.channel.send('Please use the following format: !editKeyword [keyword here] [updated value here].')
                        break;
                    case '!deletekeyword':
                        if(dictionary[channelId][messageArray[1]]){
                            delete dictionary[channelId][messageArray[1]]
                            writeJson(dictionary)
                            message.channel.send("Keyword has been removed from the database!")
                        }
                        else{
                            message.channel.send("That keyword could not be found in the database.")
                        }
                        break;
                    case '!char':
                        fetchHelper.getChar(messageArray[1]).then(res => {
                            if(res.statusCode === 400){
                                message.channel.send("YOU DONE FUCKED UP A A RON. Character doesn't exist!")
                            }
                            else{
                                message.channel.send(res.name + ' - ' + res.realm)
                                message.channel.send(res.race + ' ' + res.class + ': ' + res.active_spec_name)
                                message.channel.send('Equipped ilvl is ' + res.gear.item_level_equipped)
                                message.channel.send('Current Raider.io score is ' + res.mythic_plus_scores_by_season[0].scores.all)
                                message.channel.send('Last Updated at ' + moment(res.last_crawled_at).format('MMMM Do YYYY, h:mm:ss a'));
                            }
                        })
                        break;
                    case '!addping': 
                        let guild = client.guilds.get(channelId)
                        let guildieId = messageArray[1].replace(/[^0-9]/g,'')
                        if(guild.member(guildieId)){
                            if(serverStatusPing.length > 0){
                                //Someone has already started serverStatusChecker
                                serverStatusPing[guildieId] = guildieId
                                message.channel.send(`<@${guildieId}> will be pinged when the server is up!`)
                            }
                            else{
                                helper.recurisveStatusChecker(message, serverStatusPing, guildieId)
                            }
                        }
                        break
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
                helper.newServerIdCheck(dictionary, channelId)
                switch(messageArray[0].toLowerCase()){
                    case '!newkeyword':
                        if(messageArray[1][0] !== '!'){
                            message.channel.send("Please start the new keyword with '!' ")
                        }
                        else{
                            if(dictionary[channelId][messageArray[1].toLowerCase()]){
                                message.channel.send("Keyword is already in use! Please try another keyword or use '!editKeyword' to modify an existing entry.")
                            }
                            else{
                                dictionary[channelId][messageArray[1].toLowerCase()] = messageArray[2]
                                writeJson(dictionary)
                                message.channel.send("Keyword has been added to the database!")
                            }
                        }
                        break;
                    case '!editkeyword':
                        if(messageArray[1][0] !== '!'){
                            message.channel.send("Please start the new keyword with '!' ")
                        }
                        else{
                            if(dictionary[channelId][messageArray[1].toLowerCase()]){
                                dictionary[channelId][messageArray[1].toLowerCase()] = messageArray[2]
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
                        fetchHelper.getChar(messageArray[1], messageArray[2]).then(res => {
                            console.log(res)
                            if(res.statusCode === 400){
                                message.channel.send("YOU DONE FUCKED UP A A RON. Character doesn't exist!")
                            }
                            else{
                                message.channel.send(res.name + ' - ' + res.realm)
                                message.channel.send(res.race + ' ' + res.class + ': ' + res.active_spec_name)
                                message.channel.send('Equipped ilvl is ' + res.gear.item_level_equipped + ' with cloak rank ' + res.gear.corruption.cloakRank)
                                message.channel.send('Current Raider.io score is ' + res.mythic_plus_scores_by_season[0].scores.all)
                                message.channel.send('Last Updated at ' + moment(res.last_crawled_at).format('MMMM Do YYYY, h:mm:ss a'));
                            }
                        })
                        break;
                }
            }
        // Parse Discord Channels ------------------------------------------------------------------------------------------------------------
        }
    }
})

client.login(config.apiKey)
//Discord Bot END---------------------------------------------------------------------------------------------------------
