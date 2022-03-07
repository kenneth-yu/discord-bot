const { response } = require("express");
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

//Battle.net Fetch ------------------------------------------------------------------------------------------------
function createAccessToken(apiKey, apiSecret, region = 'us') {
  return new Promise((resolve, reject) => {
      let credentials = Buffer.from(`${apiKey}:${apiSecret}`);

      const requestOptions = {
          host: `${region}.battle.net`,
          path: '/oauth/token',
          method: 'POST',
          headers: {
              'Authorization': `Basic ${credentials.toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      };

      let responseData = '';

      function requestHandler(res) {
          res.on('data', (chunk) => {
              responseData += chunk;
          });
          res.on('end', () => {
              let data = JSON.parse(responseData);
              resolve(data);
          });
      }

      let request = require('https').request(requestOptions, requestHandler);
      // console.log(request)
      request.write('grant_type=client_credentials');
      request.end();

      request.on('error', (error) => {
          reject(error);
      });
  });
}

async function getRealmStatus(accessToken) {
  let url = `https://us.api.blizzard.com/data/wow/connected-realm/76?namespace=dynamic-us&locale=en_US&access_token=${accessToken}`
  
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


exports.getAffixes = getAffixes;
exports.getChar = getChar;
exports.getRank = getRank;
exports.createAccessToken = createAccessToken;
exports.getRealmStatus = getRealmStatus;