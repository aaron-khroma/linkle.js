//sudo node -r dotenv/config linkle.js dotenv_config_path=/meanjs/linkle/linkle.env
//sudo forever start linkle.js dotenv_config_path=/meanjs/linkle/linkle.env

//Load Linkle's secret deets
require('dotenv').config();
const deets = {
    clientId: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    public_key: process.env.PUBLIC_KEY,
    token: process.env.TOKEN,
    permInt: process.env.PERM_INT,
    alphaKey: process.env.ALPHAVANTAGE_KEY
};

//Load libraries
//const assert = require('assert');
const path = require('path');
const https = require('https');
const fs = require('fs');
const emoji = require("emojilib");
const Discord = require('discord.js');
const bot = new Discord.Client();

// Get your log file ready!
var logStream = fs.createWriteStream(path.join(__dirname, 'actions.log'), {
    flags: 'a'
});

//Log in, Linkle!
bot.login(deets.token);
bot.on('ready', () => {
    console.info(`Okay, ${bot.user.tag} is logged in!`);
});

//Reply if you can hear me!
bot.on('message', msg => {
    if (msg.author.id !== bot.user.id) {
        if (sparkle()) {
            re('act', msg, '✨');
        }
        contains(msg, new Map([
            ['$', async (msg) => {
                let $symbols = msg.content.match(/(?<=^|\s)(\$[A-Za-z\.\-]{1,16})/);
                if ($symbols) {
                    console.log('I found a stock ticker!');
                    let symbol = $symbols[0].substr(1);
                    console.log(`I'm asking AlphaAdvantage about ${symbol}.`),
                        re('ply', msg, await sendStock(symbol));
                }
            }],
            ['linkle', (msg) => {
                console.log('Someone said my nameeee!');
                re('act', msg, '✨');
            }],
            ['penis', (msg) => {
                console.log('Peener');
                re('act', msg, '🍆');
            }],
            ['retard', (msg) => {
                let replies = [
                    [`HEY!`,
                     `BRO!`,
                     `OMFG!`,
                     `THE HELL?`,
                     `WOAH, MAN!`
                    ],
                    [`That's an ableist slur.`,
                    `Not cool bro.`,
                    `I can't believe you'd say that.`,
                    `That's really insensitive to mentally challenged people.`,
                    `Would you say that if there was an autistic person on this server?`],
                    [`We say "R-word" here...`,
                    `Say "R-word" instead...`,
                    `You should say "R-word" instead...`]
                ];
                let reply = '';
                for (r in replies) {
                    reply += ' ' + replies[r][Math.floor(Math.random() * replies[r].length)];
                }
                re('ply', msg, reply);
            }]
        ]))
    }

    let spaceIndex = msg.content.indexOf(' ');
    let firstWord = (spaceIndex < 0) ? msg.content.toLowerCase() : msg.content.substring(0, spaceIndex).toLowerCase();

    console.log(`[${msg.guild.name} > ${msg.channel.name} > ${msg.author.username}] <${firstWord}`);
    switch (firstWord) {
        case 'linkle':
            re('ply', msg, `lonkle${(sparkle()) ? ' ✨' : ''}`);
            break;
        case 'sparkle':
            re('act', msg, '✨');
            break;
        default:
    }

    setTimeout(() => {
        if (msg.channel.name === 'linkles-house' && msg.embeds.length > 0) {
            console.log(`Someone is posting embeds in my house! WHAT THE HELL.`);
            let embed = msg.embeds[0];
            try {
                let reply = `An embed, in **MY HOUSE**? Anyways here's some info about it.\`\`\`
embed.description = ${embed.description}\nembed.fields.length = ${embed.fields.length}\nembed.footer = ${embed.footer}\nembed.footer = ${embed.footer}\nembed.provider = {\nname: ${embed.provider.name},\n url: ${embed.provider.url}}\nembed.thumbnail = {url: ${embed.thumbnail.url}, proxyUrl: ${embed.thumbnail.proxyUrl}, height: ${embed.thumbnail.height}, width: ${embed.thumbnail.width}}\nembed.title = ${embed.title}\nembed.type = ${embed.type}\nembed.url = ${embed.url}\nembed.thumbnail.url = {\nurl: ${embed.thumbnail.url}, \nproxyUrl: ${embed.thumbnail.proxyUrl}, \nheight: ${embed.thumbnail.height}, \nwidth: ${embed.thumbnail.width}}\n\`\`\``;
            } catch (err) {
                console.error(`This embed didn't have all the objects so Node threw a fit: ` + err);
            }
            
            re('ply', msg, reply);
        }
    }, 2000);


    if (msg.author.id === '210663001471188992') {
        console.log('S-senpai spoke to me...');
        let file = msg.attachments.first();
        if (file) {
            console.log(`Got your file, Aaron! It's called ${file.name}`);
            if (file.name.substr(file.name.indexOf('.') + 1) === 'json') {
                console.log(`And... it's apparently JSON.`);
                parseEmbed(msg, file.url);
            }
        }
    }

    //console.log(`${msg.guild.name} > ${msg.channel.name} > ${msg.author.username}`);
});

function contains(msg, strings) {
    let lowered = msg.content.toLowerCase();
    strings.forEach((callback, key, map) => {
        if (lowered.indexOf(key) >= 0) {
            callback(msg);
        }
    })
}

async function parseEmbed(msg, url) {
    let json = await downloadTxt(url);
    if (typeof json === 'object') {
        console.error(`Oh gosh, the downloader spit out an error: ${json.name} - ${json.message}`);
        return;
    }
    console.error(`Seems like the download went okay! Embed coming up.`);
    let embedObj = JSON.parse(json);
    embedObj.color = parseInt(embedObj.color.substr(2), 16);
    embedObj.timestamp = Date.now();
    re('ply', msg, {
        embed: embedObj
    });
}

function re(type, msg, reply) {

    let delay = setTimeout(() => {

        switch (type) {
            case 'ply':
                msg.channel.send(reply);
                break;
            case 'act':
                msg.react(reply);
                break;
            default:
                console.error(`You want me to re-what? Get your "type" string together. There are two choices, it's not that difficult.`);
        }
    }, Math.random * 5000);

    let dateNow = new Date();
    let duration = dateNow.getTime() - msg.createdAt.getTime();
    let logMsg = `[${dateNow.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}] DUR: ${duration} TO: ${msg.author.username} MSG: ${(type === 'act') ? '((' + emoji[reply][0] + '))' : reply}`;
    console.log(logMsg);
    logStream.write(logMsg + ' -Linkle\r\n');
}

function sendStock(symbol) {

    return new Promise((resolve, reject) => {

        var get = https.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${deets.alphaKey}`, (res) => {

            let data = '';
            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                data += chunk;
            })

            // The whole page has been received. Process it.
            res.on('end', () => {
                let quote = JSON.parse(data)['Global Quote'];
                if (quote['01. symbol'] !== undefined) {
                    let rising = (quote['09. change'].substr(0, 1) != '-');
                    let reply = `\`\`\`diff\n[[[${quote['01. symbol']} STOCK REPORT]]]\nOpened at ${quote['02. open']} | Hi: $${quote['03. high']} Lo: $${quote['04. low']} Vol: ${quote['06. volume']}\nClosed on ${quote['07. latest trading day']} at $${quote['05. price']} ${(rising) ? 'up' : 'down'} from $${quote['08. previous close']} \n${(rising) ? '+' + quote['10. change percent'] : quote['10. change percent']} (${quote['09. change']})\`\`\``;
                    resolve(reply);
                } else {
                    resolve(`${symbol.toUpperCase()} isn't a real stock symbol, silly!`);
                }

            })
        });

        get.on("error", (err) => {
            reject(`Oof, I got an error: ${err.message}`);
        })
    })
}

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
