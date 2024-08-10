const config = require('./config.json'); 
const { Client, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');
const moment = require('moment');
const helper = require('./helper.js');
const fetchHelper = require('./fetchHelper.js');
const commands = require('./deploy-commands.js')

let dictionary;
let serverStatusPing = {};
let daylightSavings = (new Date().getTimezoneOffset() / 60) === 5;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

client.on('error', (err) => {
    console.log(err.message);
});

dictionary = helper.readJson();

client.once('ready', () => {
    console.log('Bot is ready!');
});

//remember that node-scheduler uses GMT/UTC
//9:00PM EST is 02:00 UTC w/o Daylight Savings - 5 Hour Difference
//9:00PM EST is 01:00 UTC w/ Daylight Savings - 4 Hour Difference
//Warcraft Log Reminder -------------------------------------------------------------------------------------------------------
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(2, 4)];
rule.hour =  19;
rule.minute = 0;

//By default schedule warcraft log reminders
let wcLogReminder;
if(config.LOG_REMINDER){
    wcLogReminder = schedule.scheduleJob("warcraftlogs reminder", rule, function(){
        client.channels.get(`648974529217036310`).send("Reminder: " + `<@&1174712631781769398> Don't forget to set up WarcraftLogs!`)
    }); 
}
//Warcraft Log Reminder END -------------------------------------------------------------------------------------------------------
//Check Daylight Savings ----------------------------------------------------------------------------------------------------------
var checkDstRule = new schedule.RecurrenceRule();
checkDstRule.hour = 8;
checkDstRule.minute = 0;
    if(wcLogReminder){
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
    }

//Check Daylight Savings END ---------------------------------------------------------------------------------------------------------'

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    const channelId = interaction.channel.guild.id;

    switch (commandName) {
        case 'suggest':
            await interaction.guild.channels.cache.get('459125119906873345').send(options.getString('message'));
            await interaction.reply({ content: "Message sent successfully!", ephemeral: true });
            break;

        case 'newkeyword':
            if (!dictionary[channelId]) dictionary[channelId] = {};
            const newKeyword = options.getString('keyword').toLowerCase();
            const newValue = options.getString('value');
            const description = options.getString('description')
            if (dictionary[channelId][newKeyword]) {
                await interaction.reply("Keyword is already in use! Please try another keyword or use /editkeyword to modify an existing entry.");
            } else {
                dictionary[channelId][newKeyword] = {value: newValue, description: description};
                helper.writeJson(dictionary);
                await interaction.reply("Keyword has been added to the database!");
                commands.pushCustomCommands(dictionary);
            }
            break;

        case 'editkeyword':
            if (!dictionary[channelId]) dictionary[channelId] = {};
            const editKeyword = options.getString('keyword').toLowerCase();
            const editValue = options.getString('value');
            const editDescription = options.getString('description')
            if (dictionary[channelId][editKeyword]) {
                dictionary[channelId][editKeyword] = {value: editValue, description: editDescription};
                helper.writeJson(dictionary);
                await interaction.reply("Keyword has been updated!");
                commands.pushCustomCommands(dictionary);
            } else {
                await interaction.reply("That keyword could not be found in the database.");
            }
            break;

        case 'deletekeyword':
            if (!dictionary[channelId]) dictionary[channelId] = {};
            const deleteKeyword = options.getString('keyword').toLowerCase();
            if (dictionary[channelId][deleteKeyword]) {
                delete dictionary[channelId][deleteKeyword];
                helper.writeJson(dictionary);
                await interaction.reply("Keyword has been deleted!");
            } else {
                await interaction.reply("That keyword could not be found in the database.");
            }
            break;

        case 'affixes':
            const affixes = await fetchHelper.getAffixes();
            await interaction.reply('The current Mythic+ Affixes are ' + affixes.title + '.');
            break;

        case 'affixdetails':
            const affixDetails = await fetchHelper.getAffixes();
            let affixMsg = ''
            affixDetails.affix_details.forEach(affix => {
                affixMsg += `${affix.name}: ${affix.description}\n`
            })
            await interaction.reply(affixMsg)
            break;

        case 'char':
            const charName = options.getString('name');
            const charRealm = options.getString('realm') || 'sargeras';
            const characterInfo = await fetchHelper.getChar(charName, charRealm);
            if(characterInfo.statusCode === 400){
                await interaction.reply("YOU DONE FUCKED UP A A RON. Character doesn't exist!")
            }
            else{
                console.log(characterInfo.mythic_plus_scores_by_season[0].scores)
                await interaction.reply(`${characterInfo.name} - ${characterInfo.realm}\n${characterInfo.race} ${characterInfo.class}: ${characterInfo.active_spec_name}\nEquipped ilvl is ${characterInfo.gear.item_level_equipped}\nCurrent Raider.io score is ${characterInfo.mythic_plus_scores_by_season[0].scores.all}\nLast Updated at ${moment(characterInfo.last_crawled_at).format('MMMM Do YYYY, h:mm:ss a')}`)
            }
            break;

        case 'guildrank':
            const guildRank = await fetchHelper.getRank();
            if(guildRank.status !== 403){
                await interaction.reply(`Grand Central Parkway is currently rank ' + ${guildRank.realm_rank} +' on Sargeras and ' + ${guildRank.world_rank} + ' in the world.`);
            }else{
                await interaction.reply('Issue with WowProgress API. Please try again later!')
            }
            break;

        case 'setreminder':
            const reminderTime = options.getString('time');
            const reminderDate = options.getString('date') || moment().format('YYYY-MM-DD');
            const reminderDateTime = `${reminderDate} ${reminderTime}`;
            schedule.scheduleJob(moment(reminderDateTime).toDate(), function(){
                interaction.channel.send(`<@${interaction.user.id}> This is your reminder!`);
            });
            await interaction.reply(`Reminder set for ${reminderDateTime}`);
            break;

        case 'nextlogreminder':
            await interaction.reply(wcLogReminder.pendingInvocations[0].job.nextInvocation().toDate().toLocaleString())
            break;

        case 'enablelogreminder':
            if(schedule.scheduledJobs["warcraftlogs reminder"]){
                await interaction.reply('WarcraftLog Reminder is already scheduled!')
            }
            else{
                wcLogReminder = schedule.scheduleJob("warcraftlogs reminder", rule, function(){
                    client.channels.get(`648974529217036310`).send("Reminder: " + `<@&1174712631781769398> Don't forget to set up WarcraftLogs!`)
                }); 
                if(schedule.scheduledJobs["warcraftlogs reminder"]){
                    await interaction.reply('WarcraftLog Reminder successfully scheduled!')
                    config.LOG_REMINDER = true
                    helper.writeJson(config, './config.json')
                }
            }
            break;

        case 'disablelogreminder':
            if(schedule.scheduledJobs["warcraftlogs reminder"]){
                schedule.scheduledJobs["warcraftlogs reminder"].cancel()
                if(!schedule.scheduledJobs["warcraftlogs reminder"]){
                    await interaction.reply('WarcraftLog reminder is cancelled!')
                    config.LOG_REMINDER = false
                    helper.writeJson(config, './config.json')
                }
                else{
                    await interaction.reply("Failed to cancel WarcraftLog Reminder!")
                }
            }
            else{
                await interaction.reply("Warcraftlog reminder has already been disabled!")
            }
            break;

        case 'dst':
            await interaction.reply(`Daylight Savings Time is currently ${daylightSavings ? 'on' : 'off'}`);
            break;

        case 'checkdst':
            newDaylightSavings = (new Date().getTimezoneOffset() / 60) === 5;
            if(daylightSavings !== newDaylightSavings){
                daylightSavings = newDaylightSavings;
                await interaction.reply(`Daylight Savings has been updated to ${daylightSavings ? 'on' : 'off'}`);
            } else {
                await interaction.reply("Daylight Savings status has not changed.");
            }
            break;

        case 'dston':
            daylightSavings = true;
            await interaction.reply("Daylight Savings Time has been manually set to on.");
            break;

        case 'dstoff':
            daylightSavings = false;
            await interaction.reply("Daylight Savings Time has been manually set to off.");
            break;

        case 'time':
            await interaction.reply(`The current time is ${moment().format('hh:mm:ss')} EST`);
            break;

        case 'date':
            await interaction.reply(`The current date is ${moment().format('MM-DD-YYYY')} EST`);
            break;

        case 'nextraid':
                let nextRaid = wcLogReminder?.pendingInvocations[0]?.job.nextInvocation()?.toDate()
                if(nextRaid){
                    schedule.scheduledJobs["warcraftlogs reminder"] ? 
                    await interaction.reply(helper.timeUntilRaid(nextRaid)) : 
                    await interaction.reply("Seems like there is no recurring raid scheduled :slight_frown: See you when new content drops!")
                }else{
                    await interaction.reply("Seems like there is no recurring raid scheduled :slight_frown: See you when new content drops!")
                }
            break;

        case 'serverstatus':
            helper.recurisveStatusChecker(interaction, serverStatusPing, client)
            break;

        case 'pinglist':
            const pingList = serverStatusPing[channelId] || [];
            if(pingList.length){
                await interaction.reply(`Current ping list: ${pingList.join(', ')}`);
            }else{
                await interaction.reply('Pinglist is currently empty')
            }
            break;

        case 'clearpinglist':
            serverStatusPing[channelId] = [];
            await interaction.reply("Ping list has been cleared.");
            break;

        default:
            if(dictionary[channelId][commandName]){
                await interaction.reply(dictionary[channelId][commandName].value)
            }else{
                await interaction.reply("Command not found.");
            }
    }
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    const channelId = message.channel.guild.id;
    if (!dictionary[channelId]) return;

    const words = message.content.toLowerCase().split(' ');
    for (let i = 0; i < words.length; i++) {
        if (dictionary[channelId][words[i]]) {
            message.reply(dictionary[channelId][words[i]]);
            return;
        }
    }
});

client.login(config.apiKey);