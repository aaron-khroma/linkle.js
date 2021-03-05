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

//Load Linkle's secret deets
require('dotenv').config();

//Load modules
const https = require('https');
const fs = require('fs');
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

/*The Message object doesn't emit an event when a message's embeds load, 
so I have to store messages here to check later when the message updates.*/
var relinkles = [];

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
    [/(?<=^|\s)(linkle)/, (msg) => {
        console.log('Someone said my nameeee!');
        re('act', msg, '✨');
    }],

    //O__o Dirty humans...
    ['penis', (msg) => {
        console.log('Peener');
        re('act', msg, '🍆');
    }],

    //Police speech. Somewhere between an inside joke and an honest effort to address ableist stigmas.
    ['retard', (msg) => {
        let replies = [
            [
                `HEY!`,
                `BRO!`,
                `OMFG!`,
                `THE HELL?`,
                `WOAH, MAN!`,
                `UH WOW!`
            ],
            [
                `That's an ableist slur.`,
                `Not cool bro.`,
                `Did you really just say that?`
                    `I can't believe you'd say that.`,
                `I can't believe you'd say that.`,
                `That's really insensitive to mentally challenged people.`,
                `Would you say that if there was an autistic person here?`
            ],
            [
                `We say "R-word" here...`,
                `Say "R-word" instead...`,
                `You should say "R-word" instead...`
            ]
        ];
        //Assemble a randomized message out of the three phrase sets.
        let reply = '';
        for (let r in replies) {
            reply += ' ' + replies[r][Math.floor(Math.random() * replies[r].length)];
        }
        re('ply', msg, reply);
    }]
]);

bot.on('message', msg => {

    //Don't reply to yourself, silly!
    if (msg.author.id !== bot.user.id) {

        /* 
        PREFIXED COMMANDS
        Functions that will execute if Linkle's prefix is used. 
        */
        const prefix = process.env.PREFIX || '<';
        if (msg.content.substr(0, 1) === prefix) {

            command(msg);
            return;
        }

        /* 
        TRIGGERS
        Functions that will execute if a trigger string is sent.
         */
        contains(msg, triggers)

        //Attempt to turn JSON that Aaron uploads into a Discord MessageEmbed.
        if (msg.author.id === '210663001471188992') {
            let file = msg.attachments.first();
            if (file) {
                if (file.name.substr(file.name.indexOf('.')) === '.json') {
                    console.log(`Got your JSON, Aaron! It's called ${file.name}`);
                    postEmbed(msg, file.url);
                }
            }
        }
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
    //This needs a brief timeout since Discord doesn't process embeds instantly.
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

//Iterates over a map, searching for trigger words in the message and calling the associated callbacks if found.
function contains(msg, trigs) {
    let lowered = msg.content.toLowerCase();
    trigs.forEach((callback, key, map) => {
        if (typeof key === 'object') {
            let regex = new RegExp(key);
            if (regex.test(lowered)) {
                callback(msg);
            }
        } else {
            if (lowered.indexOf(key) >= 0) {
                callback(msg);
            }
        }
    })
}

//Processes and executes commands.
async function command(msg) {

    //Process the message to extract commands and args
    let cont = msg.content.toLowerCase();
    let spaceIndex = cont.indexOf(' '); //Check if we need to process args
    let cmd, args = [];
    if (spaceIndex < 0) {
        cmd = cont.substr(1);
    } else {
        cmd = cont.substring(1, spaceIndex);
        args = cont.substr(spaceIndex + 1).split(/ +/);
    }
    console.log(`[${msg.guild.name} < ${msg.channel.name} < ${msg.author.username} <${cmd}${(args.length > 0) ? cont.substr(spaceIndex) : ''}`);

    switch (cmd) {
        case 'linkle':
            re('ply', msg, `lonkle${(sparkle()) ? ' ✨' : ''}`);
            break;
        case 'sparkle':
            re('act', msg, '✨');
            break;
        case 'stock':
            if (args.length < 1) {
                re('ply', msg, 'Ya need to give me a ticker, dingus!');
                break;
            }
            try {
                re('ply', msg, await fetchStock(args[0]));
            } catch (err) {
                re('ply', msg, err);
            }
            break;
        case 'doge':
            (async () => {
                try {
                    re('ply', msg, await dogeCoin((args.length > 0) ? args[0]: undefined));
                } catch (err) {
                    re('ply', msg, err);
                }
            })()
            break;
        default:
            if(cmd.startsWith('http')) {
                relinkles.push(msg.id);
            } else {
                re('ply', msg, `I don't recognize that command...`);

            }
    }
}

//Retrieve a JSON file, process it, and post it.
async function postEmbed(msg, url) {
    let json = await downloadTxt(url);
    if (typeof json === 'object') {
        console.error(`Oh gosh, the downloader spit out an error: ${json.name} - ${json.message}`);
        return;
    }
    console.error(`Seems like the download went okay! Embed coming up.`);
    let embedObj = JSON.parse(json);
    embedObj.color = parseInt(embedObj.color.substr(2), 16);
    embedObj.timestamp = Date.now();
    try {
        re('ply', msg, { embed: embedObj });
    } catch (err) {
        console.error(`Sorry sweaty, but you did the JSON wrong: ${err.message}`);
    }
}

//Grouping multiple functions together that take actions in a guild, so that they can all use the same logging code.
function re(type, msg, reply) {

    switch (type) {
        case 'ply':
            msg.channel.send(reply);
            if (err) return err;
            break;
        case 'act':
            msg.react(reply);
            if (err) return err;
            break;
        default:
            console.error(`You want me to re-what? Get your "type" string together. There are two choices, it's not that difficult.`);
    }

    let dateNow = new Date();
    let duration = dateNow.getTime() - msg.createdTimestamp;
    let logMsg = `[${dateNow.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}] DUR: ${duration} TO: ${msg.author.username} MSG: ${(type === 'act') ? '((' + emoji[reply][0] + '))' : reply}`;
    console.log(logMsg);
    logStream.write(logMsg + ' -Linkle\r\n');
}

//Accesses the AlphaVantage API for a quote of the provided stock symbol.
function fetchStock(symbol) {

    return new Promise((resolve, reject) => {

        let cryptoName = cryptoMap.get(symbol);
        if (cryptoName === undefined) {

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
                            let reply = `\`\`\`diff\n[[[${quote['01. symbol']} STOCK REPORT]]]\nOpened at ${quote['02. open']} | Hi: $${quote['03. high']} Lo: $${quote['04. low']} Vol: ${quote['06. volume']}\nClosed on ${quote['07. latest trading day']} at $${quote['05. price']} ${(rising) ? 'up' : 'down'} from $${quote['08. previous close']} \n${(rising) ? '+' + quote['10. change percent'] : quote['10. change percent']} (${quote['09. change']})\`\`\``;
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

        } else {
            resolve(`I think ${symbol.toUpperCase()} is a crypto ticker for ${cryptoName}. I don't know how to retrieve those yet...`);
        }


    })
}

//Accesses the AlphaVantage API for a dogeCoin quote in USD or the currency given.
function dogeCoin(curr) {

    return new Promise((resolve, reject) => {

        let endpoint = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=DOGE&to_currency=${(curr === undefined) ? 'USD' : curr}&apikey=${process.env.ALPHAVANTAGE_KEY}`;
        var get = https.get(endpoint, (res) => {

            let data = '';
            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                data += chunk;
            })

            // The whole page has been received. Process it.
            res.on('end', () => {

                console.log(data);
                if (data.length > 0) {

                    let response = JSON.parse(data);
                    if (response['Error Message'] !== undefined) {

                        console.error(response['Error Message']);
                        reject((curr === undefined) ? `Hm weird, the service didn't send anything back...` : `The service I use didn't return anything for ${curr}`);

                    } else if (response['Realtime Currency Exchange Rate'] !== undefined) {

                        let quote = response['Realtime Currency Exchange Rate'];
                        let value = quote['5. Exchange Rate'];
                        value = (curr === undefined || curr.toLowerCase() == 'usd') ? '$' + value : value;
                        let reply = `[${quote['1. From_Currency Code']} => ${quote['3. To_Currency Code']}] ${value}`;
                        resolve(reply);

                    } else {
                        reject('Something really weird happened...');
                    }
                }
            })
        });

        get.on("error", (err) => {
            reject(`Oof, I got an error: ${err.message}`);
        });

    });
}

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
        console.log(`Looks like the crypto map is ${cryptoMap.size} entries long. ${(cryptoMap.size > 0) ? `Nice.` : `Fuck`}`);
    }

}
loadCryptoMap();

//Downloads a file and returns the data as a string.
function downloadTxt(url) {

    return new Promise((resolve, reject) => {

        let json = '';
        const request = https.get(url, res => {
            if (res.statusCode !== 200) {
                let errorMessage = (url.indexOf('discord') < 0) ?
                    `The domain didn't send me the resource.` :
                    `Something's up with the Discord CDN...`;
                reject(new Error(`${errorMessage} (${res.statusCode})`));
                return;
            }

            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                json += chunk;
            })
            // All data has been recieved.
            res.on('end', (chunk) => {
                resolve(json);
            })
        });

        request.on('error', err => {
            reject(err);
        });

        request.end();
    });
}

function sparkle() {
    return (Math.random() < 0.05);
}
