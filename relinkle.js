const path = require('path');
const mongo = require('mongodb').MongoClient;

module.exports = class Relinkle {

    static endpoint = 'mongodb://localhost:27017/faenor';
    //Extensions used by media files https://www.reddit.com/r/discordapp/comments/f2kt5r/guide_file_formats_discord_can_embed/
    static imageExts = ['jpg', 'jpeg', 'png', 'gif', 'gifv', 'webm', 'mp4', 'wav', 'mp3', 'ogg'];
    static videoExts = ['gifv', 'webm', 'mp4'];
    
    static writeRelinkle(doc) {
        // Connect to Mongo.
        mongo.connect(this.endpoint, function (err, db) {
    
            if (err) throw err;
    
            //Write databse Insert/Update/Query code here..
            //http://mongodb.github.io/node-mongodb-native/3.6/api/Db.html
    
        });
    }

    constructor (server) {

        this.server = server;

        this.relinkle = (msg) => {

            //Default object data
            let object = {
                'thumbnail' : {
                    'url': 'https://styleeyescreative.com/icons/linkle/Relinkle-icon_'
                },
                'footer': {
                    'text': 'Love, Linkle',
                    'icon_url': 'https://styleeyescreative.com/icons/linkle/Linkle.png'
                }
            };

            let link, text, input = msg.content.substr(1).trim();
            let spaceIndex = content.indexOf(' ');
            if (spaceIndex > 0) { //It should never be zero because it's trimmed
                link = input.substring(0, spaceIndex); //A link
                text = input.substr(spaceIndex + 1); //Additional text for caption
            } else if (input.startsWith('http')) {
                link = input;
            } else {
                text = input;
            }

            let images = [], videos = [], files = [];
            //If the message has attachments.
            if (msg.attachments.size > 0) {
                msg.attachments.each((att) => {
                    if (Relinkle.imageExts.includes(path.extname(att.name))) {
                        images.push(att);
                    } else if (Relinkle.videoExts.includes(path.extname(att.name))) {
                        videos.push(att);
                    } else {
                        files.push(att);
                    }
                })
            }

            
        };
    }
};

/*

{
    "color": "0x00AE42",
    "title": "Style Eyes Creative",
    "url": "https://styleeyescreative.com",
    "author": {
        "name": "Hydrolaze#1964",
        "icon_url": "https://cdn.discordapp.com/avatars/210663001471188992/e04a2aee7697acdc44eb3924d1392276.png?size=128",
        "url": "https://sunyhakas.com"
    },
    "description": "Aaron, Tim, and Amanda, a three-person design cooperative.",
    "thumbnail": {
        "url": "https://styleeyescreative.com/images/SEC_dither-lozenge-logo.png"
    },
    "fields": [
        {
            "name": "We are Style Eyes Creative,",
            "value": "a small team of designers with a wide set of skills. We pride ourselves on high quality designs, honest and open communication, and quick turnaround times. Whatever creative challenges you face, we’ll be your eyes for style! http://behance.net/eyesforstyle"
		},
        {
            "name": "Graphic Design",
            "value": "⬧ Logos & Branding\n⬧ Print & Packaging",
            "inline": true
		},
        {
            "name": "Illustration",
            "value": "⬧ Vector\n⬧ Digital",
            "inline": true
		},
        {
            "name": "Animation",
            "value": "⬧ Motion Graphics\n⬧ Social Media GIFs\n⬧ Explainer Videos\n⬧ 3D Animation",
            "inline": true
		}
	],
    "image": {
        "url": "https://styleeyescreative.com/images/branding.png"
    },
    "timestamp": 0,
    "footer": {
        "text": "Let us be your eyes for style.",
        "icon_url": "https://styleeyescreative.com/icons/sticker-lozenge-icon-256.png"
    }
}

*/