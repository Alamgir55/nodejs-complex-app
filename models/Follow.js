const usersCollection = require('../db').db().collection('users');
const followsCollection = require('../db').db().collection('follows');
const ObjectID = require('mongodb').ObjectID;
const User = require('./user');

let Follow = function(followedUsername, authorId){
    this.followedUsername = followedUsername;
    this.authorId = authorId;
    this.errors = [];
}

Follow.prototype.cleanUp = function(){
    if(typeof(this.followedUsername) != 'string'){this.followedUsername = ""}
}

Follow.prototype.validate = async function(action){
    let followedAccount = await usersCollection.findOne({username: this.followedUsername});
    
    if(followedAccount){
        this.followedId = followedAccount._id;
       
    }else{
        this.errors.push('You can not followed a user that does not exits');
    }
    let doesFollowAlreadyExits = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)});
    if(action == 'create'){
        if(doesFollowAlreadyExits){this.errors.push('You already following.')}
    }
    if(action == 'delete'){
        if(!doesFollowAlreadyExits){this.errors.push('You can not stop following someone you do not already follow')}
    }
    if(this.followedId.equals(this.authorId)){this.errors.push('You can not follow yourself')}
}

Follow.prototype.create = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp();
        await this.validate('create');
        if(!this.errors.length){
            await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)});
            resolve();
        }else{
            reject(this.errors);
        }
    });
}

Follow.prototype.delete = function(){
    return new Promise(async (resolve, reject)=>{
        this.cleanUp();
        await this.validate('delete');
        if(!this.errors.length){
            await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectID(this.authorId)});
            resolve();
        }else{
            reject(this.errors);
        }
    });
}

Follow.isVisitorFollowing = async function(followedId, VisiterId){
    let followDoc =  await followsCollection.findOne({followedId: followedId, authorId: new ObjectID(VisiterId)});
    
    if(followDoc){
        return true;
    }else{
        return false;
    }
}

Follow.getFollowersById = function(id){
    return new Promise(async (resolve, reject)=> {
        try{
            let followers = await followsCollection.aggregate([
                {$match: {followedId: id}},
                {$lookup: {from: 'users', localField: 'authorId', foreignField: '_id', as: 'userDoc'}},
                {$project: {
                    username: {$arrayElemAt: ['$userDoc.username', 0]},
                    email: {$arrayElemAt: ['$userDoc.email', 0]}
                }}
            ]).toArray();
            followers = followers.map(function(follower){
                let user = new User(follower, true);
                return {username: follower.username, avatar: user.avatar}
            });
            resolve(followers);
        }catch{
            reject();
        }
    });
}


module.exports = Follow;