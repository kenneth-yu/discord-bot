let fs = require('fs')

//JSON Read/Write --------------------------------------------------------------------------------------------
const readJson = dictionary => {
    fs.readFile('./dictionary.json', 'utf8', (err, jsonString) => {
        if (err) {
            console.log("Error reading file from disk:", err)
            return err
        }
        try {
            console.log(dictionary, "before if and else")
            if(dictionary){
                dictionary = JSON.parse(jsonString)
                console.log("JSON file was read successfully and dictionary has been updated")
            }
            else{
                dictionary = JSON.parse(jsonString)
                console.log("JSON file was read successfully and dictionary is setting for the first time")
            }
            console.log(dictionary)
            return dictionary
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
const newServerIdCheck = (dictionary, channel_id) => {
    console.log(dictionary, "NEW SEVER ID CHECK FUNCTION")
    console.log(channel_id)
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

const timeUntilRaid = (daylightSavings) => {
    // Get current date and time
    let today = new Date();
  
    // Get number of days to Raid Day
    let dayNum = today.getDay();
    //In EST our raid times are Wed/Thur at 9PM. In UTC it is Thur/Fri at 1/2AM
    let nextRaidDay = 4
    let daysToRaid = 0
    //9:00PM EST is 00:00 UTC w/o Daylight Savings - 5 Hour Difference
    //9:00PM EST is 01:00 UTC w/ Daylight Savings - 4 Hour Difference
    let raidTimeUTC = daylightSavings ? 2 : 1
    if(dayNum === 4){ //Handles Wednesday(3) EST or Thursday(4) UTC
        if(today.getHours() < raidTimeUTC && today.getMinutes() < 59 && tday.getSeconds() < 59){
            nextRaidDay = 4
            daysToRaid = 0
        }
        else{
            // It is Thusday at 1 AM. Our next Raid is Friday at 1 AM 
            // Thursday is 4 and Friday is 5
            nextRaidDay = 5
            daysToRaid = 1  
        }
    } 
    else{
        if(dayNum > 4){ //Handles Friday (5) to Saturday(6)
            if(dayNum === 5 && today.getHours() < raidTimeUTC && today.getMinutes() < 59 && today.getSeconds() < 59){
                nextRaidDay = 5
                daysToRaid = 0
            }
            else{
                daysToRaid = 7 - dayNum + nextRaidDay
            }
        }
        else if (dayNum < 4){ //Handles Sunday(0) to Wednesday(3)
            daysToRaid = nextRaidDay - dayNum
        }
    }
    // Get milliseconds to raid time
    let raidTime = new Date(+today);
    raidTime.setDate(raidTime.getDate() + daysToRaid);
    raidTime.setHours(raidTimeUTC,0,0,0);
    // Round up ms remaining so seconds remaining matches clock
    let ms = Math.ceil((raidTime - today)/1000)*1000;
    let d =  ms / 8.64e7 | 0;
    let h = (ms % 8.64e7) / 3.6e6 | 0;
    let m = (ms % 3.6e6)  / 6e4 | 0;
    let s = (ms % 6e4)    / 1e3 | 0;

    let days = d === 0 ? "" : `${d} Days, `
    let hours = d === 0 && h === 0 ? "" : `${h} Hours, `
    let minutes = d === 0 && h === 0 && m === 0 ? "" : `${m} Minutes, `
    return `Our next raid is in ${days}${hours}${minutes}and ${s} Seconds.`
  }
//Helper Functions END -----------------------------------------------------------------------------------------------



exports.readJson = readJson;
exports.writeJson = writeJson;
exports.newServerIdCheck = newServerIdCheck;
exports.argCompiler = argCompiler;
exports.timeUntilRaid = timeUntilRaid;