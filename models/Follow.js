const usersCollection = require('../db').db().collection('users');
const followsCollection = require('../db').db().collection('follows');
const ObjectID = require('mongodb').ObjectID;

let Follow = function(followedUsername, authorId){
    this.followedUsername = followedUsername;
    this.authorId = authorId;
    this.errors = [];
}

Follow.prototype.cleanUp = function(){
    if(typeof(this.followedUsername) != 'string'){this.followedUsername = ""}
}

Follow.prototype.validate = async function(){
    let followedAccount = await usersCollection.findOne({username: this.followedUsername});
    
    if(followedAccount){
        this.followedId = followedAccount._id;
       
    }else{
        this.errors.push('You can not followed a user that does not exits');
    }
}

Follow.prototype.create = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp();
        this.validate();
        if(!this.errors.length){
            await followsCollection.insertOne({followedId: new ObjectID(this.followedId), authorId: new ObjectID(this.authorId)});
            resolve();
        }else{
            reject(this.errors);
        }
    });
}

module.exports = Follow;