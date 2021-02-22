var mongo = require('mongodb').MongoClient;

// Connect to the db
mongo.connect("mongodb://localhost:27017", function (err, db) {
   
     if(err) throw err;

     //Write databse Insert/Update/Query code here..
                
});

class Linkle(channel) {
    
    constructor(channel) {
        this.channel = channel;
    }
    
    process(msg) {
        
        let link = {
            author: msg.author.id,
            url: msg//Need to figure out how to get the URL
        };
        
    }
    
    
    
}