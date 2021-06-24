/*  
 _                _      _                          
( )     _        ( )    (_ )                _       
| |    (_)  ___  | |/')  | |    __         (_)  ___ 
| |  _ | |/' _ `\| , <   | |  /'__`\       | |/',__)
| |_( )| || ( ) || |\`\  | | (  ___/ _     | |\__, \
(____/'(_)(_) (_)(_) (_)(___)`\____)(_) _  | |(____/
                                       ( )_| |      
                                       `\___/'    Aaron Khroma 2021 */

//LAUNCH
//sudo nodemon -r dotenv/config linkle.js dotenv_config_path=/meanjs/linkle/linkle.env

/* 
_ _  _ _ ___ _ ____ _    _ ___  ____ ___ _ ____ _  _ 
| |\ | |  |  | |__| |    |   /  |__|  |  | |  | |\ | 
| | \| |  |  | |  | |___ |  /__ |  |  |  | |__| | \| 

*/

//Load Linkle's secret deets, no peekin' mah tokens!
require('dotenv').config();

//Load modules
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
//const assert = require('assert'); Not ready to get into assert...
const path = require('path');
const emoji = require("emojilib");
const Discord = require('discord.js');
const bot = new Discord.Client();

// Get your log file ready!
var logStream = fs.createWriteStream(path.join(__dirname, 'actions.log'), {
  flags: 'a'
});

//Log in, Linkle!
bot.login(process.env.TOKEN);
bot.on('ready', () => {
  console.info(`Okay, ${bot.user.tag} is logged in!`);
});

///////////////////////////////////////////////////////////////////
///// !!! UNDER CONSTRUCTION !!! //////////////////////////////////
///////////////////////////////////////////////////////////////////
/*
// The data for our command
const commandData = {
  name: 'echo',
  description: 'Replies with your input!',
  options: [{
    name: 'input',
    type: 'STRING',
    description: 'The input which should be echoed back',
    required: true,
  }],
};

client.once('ready', () => {
  // Creating a global command
  client.application.commands.create(commandData);

  // Creating a guild-specific command
  client.guilds.cache.get('id').commands.create(commandData);
});
*/
///////////////////////////////////////////////////////////////////

/*
____ _  _ ____ _  _ ___ ____ 
|___ |  | |___ |\ |  |  [__  
|___  \/  |___ | \|  |  ___] 

*/

/*The Message object doesn't emit an event when a message's embeds load, 
so I have to store messages here to check later when the message updates.
(There's probably a better way to do this...) */
var relinkles = [];

bot.on('message', msg => {

  //Don't reply to yourself, silly!
  if (msg.author.id !== bot.user.id) {

    /* 
    PREFIXED COMMANDS
    Functions that will execute if Linkle's prefix is used. 
    */
    const prefix = process.env.PREFIX || '>';
    if (msg.content.startsWith(prefix)) {

      //Attach a timestamp since Discord's server time is different
      msg.linkleSawAt = Date.now();

      command(msg);
      return;
    }

    /* 
    TRIGGERS
    Functions that will execute if a trigger string is sent.
     */
    contains(msg, triggers);

    //Attempt to turn JSON that Aaron uploads into a Discord MessageEmbed.
    if (msg.author.id === '210663001471188992') {
      let file = msg.attachments.first();
      if (file) {
        if (file.name.substr(file.name.indexOf('.')) === '.json') {
          console.log(`Got your JSON, Aaron! It's called ${file.name}`);
          postEmbed(msg, file.url);
        }
      }
    } //end if
  }
});

bot.on('messageUpdate', (oMsg, msg) => {

  //Check if the message was previously saved as being prefixed.
  let index = relinkles.indexOf(msg.id);
  if (index > -1) {

    console.log(`Found a cool embed link! ${msg.embeds[0].url}`);
    relinkles.splice(index, 1);
  }

  //A testing function to help me figure out how to make embeds look good.
  if (msg.channel.name === 'linkles-house' && msg.author.id !== bot.user.id) {
    if (msg.embeds.length > 0) {
      console.log(`Someone is posting embeds in my house! WHAT THE HELL.`);
      let embed = msg.embeds[0];
      let reply = 'null';
      try {
        reply = 'An embed, in **MY HOUSE**? Anyways here\'s some info about it.```' +
          `embed.description = ${embed.description}\n` +
          `embed.fields.length = ${embed.fields.length}\n` +
          `embed.footer = ${embed.footer}\n` +
          ((embed.provider !== null) ?
            `embed.provider = {\n` +
            `    name: ${embed.provider.name},\n` +
            `    url: ${embed.provider.url} }\n` :
            `embed.provider = undefined\n`) +
          ((embed.thumbnail !== null) ?
            `embed.thumbnail = {\n` +
            `    url: ${embed.thumbnail.url},\n` +
            `    proxyUrl: ${embed.thumbnail.proxyUrl},\n` +
            `    height: ${embed.thumbnail.height},\n` +
            `    width: ${embed.thumbnail.width} }\n` :
            `embed.thumbnail = undefined\n`) +
          `embed.title = ${embed.title}\n` +
          `embed.type = ${embed.type}\n` +
          `embed.url = ${embed.url}` + '```';
      } catch (err) {
        console.error(`Uhhhh, not sure what went wrong since I did checks to make sure everything was defined: ` + err);
      }
      re('ply', msg, reply);
    }
  }
})

/* 
_  _ ____ _  _ ___  _    ____ ____ ____ 
|__| |__| |\ | |  \ |    |___ |__/ [__  
|  | |  | | \| |__/ |___ |___ |  \ ___] 

*/

//For TikTok links
const tikTokUrl = /https:\/\/vm\.tiktok\.com\/[A-Za-z0-9]{9}\//;
//Words and expressions that Linkle will respond to with unique functions.
var triggers = new Map([

  //If there is a dollar sign in the message, perform a more intensive RegEx search for stock symbols.
  ['$', async (msg) => {
    let $symbols = msg.content.match(/(?<=^|\s)(\$[A-Za-z\.\-]{1,16})/);
    if ($symbols) {
      let symbol = $symbols[0].substr(1).toLowerCase();
      console.log(`Found a stock ticker! I'll ask AlphaAdvantage about ${symbol}.`);
      re('ply', msg, await fetchStock(symbol));
    }
  }],

  //If someone says something like "Linkle", "linkle-esque", or "Linkle's", put a sparkle on it! 
  [/(?<=^|\s)(linkle)/i, (msg) => {
    console.log('Someone said my nameeee!');
    re('act', msg, '✨');
  }],

  //Post TikTok thumbnails.
  [tikTokUrl, async (msg) => {
    console.log('Ugh, a TikTok link...');
    await getTikTokThumbnail(msg.content.match(tikTokUrl)[0]).then(value => {
      re('ply', msg, `Look at ${sparkle() ? 'this :sparkle:garbage:sparkle: that' : 'what'} <@${msg.author.id}> sent! `);
      re('ply', msg, value);
    }).catch(err => {
      re('ply', msg, `:rotating_light: **TIKTOK ERROR** :rotating_light:\n${err}`);
    });
    
  }],
]);

//Iterates over a map, searching for trigger words in the message and calling the associated callbacks if found.
function contains(msg, triggers) {
  triggers.forEach((callback, key, map) => {
    if (typeof key === 'object') {
      let regex = new RegExp(key);
      if (regex.test(msg.content)) {
        callback(msg);
      }
    } else {
      let lowered = msg.content.toLowerCase();
      if (lowered.indexOf(key) >= 0) {
        callback(msg);
      }
    }
  })
}

//Processes and executes commands.
async function command(msg) {

  //Process the message to extract commands and arguments
  let cont = msg.content.substr(1).trim().toLowerCase();
  let spaceIndex = cont.indexOf(' '); //Check if we need to process args
  let cmd, args = [];
  if (spaceIndex < 0) {
    cmd = cont;
  } else {
    cmd = cont.substring(0, spaceIndex);
    args = cont.substr(spaceIndex + 1).split(/ +/);
  }
  console.log(`[${msg.guild.name} > #${msg.channel.name} > @${msg.author.username} >${cmd}${(args.length > 0) ? cont.substr(spaceIndex) : ''}`);

  switch (cmd) {
    case 'linkle':
      re('ply', msg, `lonkle${(sparkle()) ? ' ✨' : ''}`);
      break;
    case 'sparkle':
      re('act', msg, '✨');
      break;
    case '$':
    case 'stock':
      if (args.length < 1) {
        re('ply', msg, 'Ya need to give me a ticker, dingus!');
        break;
      }
      (async () => {
        try {
          re('ply', msg, await fetchStock(args[0]));
        } catch (err) {
          re('ply', msg, err);
        }
      })()
      break;
    case 'curr':
    case 'c':
      if (args.length < 1) {
        re('ply', msg, 'Ya need to give me a currency code, dingus!');
        break;
      }
      (async () => {
        try {
          re('ply', msg, await fetchCurr(args[0], args[1]));
        } catch (err) {
          re('ply', msg, err);
        }
      })()
      break;
    case 'doge':
      (async () => {
        try {
          re('ply', msg, await dogeCoin(args[0]));
        } catch (err) {
          re('ply', msg, err);
        }
      })()
      break;
    case 'help':
      switch (args[0]) {
        case 'linkle':
          re('ply', msg, `\`> linkle\`\n*You say linkle, I say lonkle! Easy way to check if I'm online.*`);
          break;
        case 'sparkle':
          re('ply', msg, `\`> sparkle\`\n*I'm a simple girl. I hear a sparkle, I give a sparkle.*`);
          break;
        case 'stock':
        case '$':
          re('ply', msg, `\`> stock [ticker]\`\n\`> $ [ticker]\`\n*I'll ring up my friends at AlphaVantage and fetch a report about the stock that you provide a ticker for.'*`);
          break;
        case 'curr':
        case 'c':
          re('ply', msg, `\`> curr [from] [to|USD]\`\n\`> c [from] [to|USD]\`\n*I'll ring up the dudes at AlphaVantage and get the conversion rate for any two real or virtual currencies. If you don't give me a second one I'll just do USD.*`);
          break;
        case 'doge':
          re('ply', msg, `\`> doge\`\n*wow. so gains. much tendies. Say this and I'll tell ya what Dogecoin is worth.*`);
          break;
        case undefined:
          re('ply', msg, `**COMMANDS:** linkle, sparkle, stock, curr, doge.\n*Type help [command] for more info.*`);
          //Sometimes say "no" lol
          break;
        default:
          re('ply', msg, `Help you with what? I don't understand.\nType >help for my command list.`);
      }
      break;
    default:
      if (cmd.startsWith('http') || msg.attachments.length > 0) {
        relinkles.push(msg.id);
        //reli.relinkle(msg);
      } else {
        re('ply', msg, `I don't recognize that command...`);
      }
  }
}

//Retrieve a JSON file, process it, and post it.
async function postEmbed(msg, url) {
  let json = await downloadString(url);
  if (typeof json === 'object') {
    console.error(`Oh gosh, the downloader spit out an error: ${json.name} - ${json.message}`);
    return;
  }
  console.error(`Seems like the download went okay! Embed coming up.`);
  let embedObj = JSON.parse(json);
  embedObj.color = parseInt(embedObj.color.substr(1), 16); //"#000000"
  embedObj.timestamp = Date.now();
  try {
    re('ply', msg, { embed: embedObj });
  } catch (err) {
    console.error(`Sorry sweaty, but you did the JSON wrong: ${err.message}`);
  }
}

/* 
___  _ ____ ____ ____ ____ ___  
|  \ | [__  |    |  | |__/ |  \ 
|__/ | ___] |___ |__| |  \ |__/ 
 
*/

//Grouping multiple functions together that take actions in a guild, so that they can all use the same logging code.
function re(type, msg, reply) {

  switch (type) {
    case 'ply':
      if (reply) {
        //You can't send empty messages
        reply = (reply.length > 0) ? reply : ':regional_indicator_n::regional_indicator_u::regional_indicator_l::regional_indicator_l::zany_face:';
        //You can't send messages longer than 2,000 characters
        if (reply.length > 2000) {
          reply = reply.substr(0, 1983) + '... (too long)';
          //Close code blocks
          if (reply.includes('```')) reply += '```';
        };
        msg.channel.send(reply);
      }
      break;
    case 'act':
      msg.react(reply);
      break;
    default:
      console.error(`You want me to re-what? Get your "type" string together. There are two choices, it's not that difficult.`);
  }

  let dateNow = new Date();
  console.log(`timestamps: ${msg.linkleSawAt} > ${dateNow.getTime()}`);
  let duration = dateNow.getTime() - msg.linkleSawAt;
  let logMsg = `[${dateNow.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}] DUR: ${duration}ms TO: ${msg.author.username} MSG: ${(type === 'act') ? '((' + emoji[reply][0] + '))' : reply}`;
  console.log(logMsg);
  logStream.write(logMsg + ' -Linkle\r\n');
}

/*
____ _   _ ____ ___ ____ _  _ 
[__   \_/  [__   |  |___ |\/| 
___]   |   ___]  |  |___ |  |  

*/

function readTxt(url) {

  return new Promise((resolve, reject) => {

    fs.readFile(url, 'utf8', (err, data) => {
      if (err) { reject(err) };
      resolve(data);
    });

  });

}

var cryptoMap = new Map();
async function loadCryptoMap() {

  try {
    let csv = await readTxt('data/crypto.csv');
    let rows = csv.split(/\r\n/);
    for (let r in rows) {
      let row = rows[r].split(',');
      cryptoMap.set(row[0].toLowerCase(), row[1]);
    }
  } catch (err) {
    console.log(`Aw, I can't get the crypto map: ${err}`)
  } finally {
    console.log(`Looks like the crypto map is ${cryptoMap.size} entries long. ${(cryptoMap.size > 0) ? `Nice.` : `Fuck.`}`);
  }

}
loadCryptoMap();

function sparkle() {
  return (Math.random() < 0.05);
}

/* 
____ ____ ____ _  _ ____ ____ ___ 
|__/ |___ |  | |  | |___ [__   |  
|  \ |___ |_\| |__| |___ ___]  |  
 
*/

//Accesses the AlphaVantage API for a quote of the provided stock symbol.
function fetchStock(symbol) {

  let cryptoName = cryptoMap.get(symbol);
  if (cryptoName !== undefined) {

    re('ply', msg, `Ooh uh... ${cryptoName} is a cryptocurrency, you gotta use the \`>curr\` command for that. I'll do it for you this time tho, don't worry.`);
    return fetchCurr(symbol);
  }

  return new Promise((resolve, reject) => {

    var reqOut = Date.now();
    var get = https.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHAVANTAGE_KEY}`, (res) => {

      let data = '';
      // A chunk of data has been recieved.
      res.on('data', (chunk) => {
        data += chunk;
      })

      // The whole page has been received. Process it.
      res.on('end', () => {
        let quote = JSON.parse(data)['Global Quote'];
        if (quote !== undefined) {
          if (quote['01. symbol'] !== undefined) {
            let rising = (quote['09. change'].substr(0, 1) != '-');
            let reply = `\`\`\`diff\n[[[${quote['01. symbol']} STOCK REPORT]]] ${Date.now() - reqOut}ms\nOpened at ${quote['02. open']} | Hi: $${quote['03. high']} Lo: $${quote['04. low']} Vol: ${quote['06. volume']}\nClosed on ${quote['07. latest trading day']} at $${quote['05. price']} ${(rising) ? 'up' : 'down'} from $${quote['08. previous close']} \n${(rising) ? '+' + quote['10. change percent'] : quote['10. change percent']} (${quote['09. change']})\`\`\``;
            resolve(reply);
          } else {
            resolve(`${symbol.toUpperCase()} isn't a real stock symbol, silly!`);
          }
        }
      })
    });

    get.on("error", (err) => {
      reject(`Oof, I got an error: ${err.message}`);
    })
  })
}

//Accesses the AlphaVantage API for a quote of the provided stock symbol.
function fetchCurr(from, to) {

  return new Promise((resolve, reject) => {

    var reqOut = Date.now();
    var get = https.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to || 'USD'}&apikey=${process.env.ALPHAVANTAGE_KEY}`, (res) => {

    /*  
    {
      "Realtime Currency Exchange Rate": {
        "1. From_Currency Code": "USD",
        "2. From_Currency Name": "United States Dollar",
        "3. To_Currency Code": "JPY",
        "4. To_Currency Name": "Japanese Yen",
        "5. Exchange Rate": "108.85000000",
        "6. Last Refreshed": "2021-03-18 05:59:01",
        "7. Time Zone": "UTC",
        "8. Bid Price": "108.85000000",
        "9. Ask Price": "108.85000000"
      } 
    } 
      OR
    {
        "Error Message": "Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for CURRENCY_EXCHANGE_RATE."
    }
    */

      let data = '';
      // A chunk of data has been recieved.
      res.on('data', (chunk) => {
        data += chunk;
      })

      // The whole page has been received. Process it.
      res.on('end', () => {
        let quote = JSON.parse(data)['Realtime Currency Exchange Rate'];
        if (quote !== undefined) {
          if (quote['1. From_Currency Code'] !== undefined) {
            let rate = parseFloat(quote['5. Exchange Rate']);
            rate = (rate < 0.1) ? rate.toFixed(4) : rate.toFixed(2);
            let reply = `\`\`\`diff\n[[[ ${quote['1. From_Currency Code']} 1 => ${quote['3. To_Currency Code']} ${rate} ]]] ${Date.now() - reqOut}ms\`\`\``;
            resolve(reply);
          }
        } else {
          reject(`Doesn't work, dunno why. Do better next time.`);
        }
      })
    });

    get.on("error", (err) => {
      reject(`Oof, I got an error: ${err.message}`);
    })
  })
}

//Accesses the AlphaVantage API for a dogeCoin quote in USD or the currency given.
function dogeCoin(curr) {

  return fetchCurr('doge'); //wow
}

//Downloads a file and returns the data as a string.
function downloadString(url) {

  //I did some experimentation and found out that my browser sends these headers.
  //I tried spoofing them here in the hopes of a better response from TikTok.
  let options = {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-GB;q=0.6',
      'Sec-Fetch-User': '?1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36'
    }
  };

  return new Promise((resolve, reject) => {

    let str = '';
    const request = https.request(url, res => {
      if (res.statusCode !== 200) {
        let errorMessage = (url.indexOf('discord') < 0) ?
          `The domain didn't send me the resource.` :
          `Something's up with the Discord CDN...`;
        reject(new Error(`${errorMessage} (${res.statusCode}: ${res.statusMessage})`));
        return;
      }

      // A chunk of data has been recieved.
      res.on('data', (chunk) => {
        str += chunk;
      })
      // All data has been recieved.
      res.on('end', (chunk) => {
        resolve(str);
      })
    });

    request.on('error', err => {
      reject(err);
    });

    request.end();
  });
}

//A mess of a function that retrieves a TikTok thumbnail at great personal expense to Linkle.
//For some reason TikTok's servers don't return a thumbnail when a TikTok link is normally posted, so this function is my attempt to provide some sort of context for what the TikTok post is about without having to actually look at it.
function getTikTokThumbnail(url) {

  console.log(`Going to check out ${url}`);
  return new Promise((resolve, reject) => {

    let str = '';
    const redirect = https.request(url, res => {
      if (res.statusCode !== 301) {
        reject(`Oof, I think TikTok is down? ${res.statusCode}: ${res.statusMessage}`);
        return;
      }

      // A chunk of data has been recieved.
      res.on('data', (chunk) => {
        str += chunk;
      })

      // All data has been recieved.
      res.on('end', async (chunk) => {

        let trueUrlRegex = /href="([\S]+)"/;
        let rawUrl = str.match(trueUrlRegex)[1]; //This is the (group)
        let trueUrl = rawUrl.replace(/\&amp;/g, '&'); //Idk why I have to do this...
        console.log(`Okay, I got the nasty true URL: ${trueUrl}`);
        let reactPage;
        exec(`curl -v ${trueUrl}`, function (err, stdout, stderr) {

          if (err) {
            console.log(err);
            reject(`I honestly don't even know what this error is. <@210663001471188992>???:\n\`\`\`${err}\`\`\``);
          }
          if (stderr) {
            console.log(stderr);
          }
          reactPage = stdout;

          let tnPosition = reactPage.indexOf('"covers":["');
          if (reactPage.length == 0) {
            reject(`Fucking TikTok didn't send me anything! :rage:`);
            return;
          } else if (tnPosition < 0) {
            reject(`I didn't find the "covers" in TikTok's response. No URL, sorry. :person_shrugging`);
            console.log(`\n\n\nWHAT THE FUCK\n${reactPage}\n\n\n`);
            return;
          }
          let urlStart = tnPosition + 11;
          let thumbnail = reactPage.substring(urlStart, reactPage.indexOf('"', urlStart + 1));
          resolve(thumbnail);
        });

      })
    });

    redirect.on('error', err => {
      console.log(error);
      reject(`Not sure what this error is for. I'm not even sure if you should be able to see this message. <@210663001471188992>???:\n\`\`\`${err}\`\`\``);
    });

    redirect.end();
  });
}