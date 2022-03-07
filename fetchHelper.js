const fetch = require("node-fetch");

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

exports.getAffixes = getAffixes;
exports.getChar = getChar;
exports.getRank = getRank;