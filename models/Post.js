const postsCollection = require('../db').db().collection('posts');
const followssCollection = require('../db').db().collection('follows');
const ObjectID = require('mongodb').ObjectID;
const User = require('./User');
const sanitizeHTML = require('sanitize-html'); 

let Post = function(data, userid, resquestedPostId){
    this.data = data;
    this.errors = [];
    this.userid = userid;
    this.resquestedPostId = resquestedPostId;
}

Post.prototype.cleanUp = function(){
    if(typeof(this.data.title) != "string") {this.data.title = ""}
    if(typeof(this.data.body) != "string") {this.data.body = ""}

    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
        body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function(){
    if(this.data.title == ""){this.errors.push("You must provide a title")}
    if(this.data.body == ""){this.errors.push("You must provide post content")}
}

Post.prototype.create = function(){
    return new Promise((resolve, reject)=>{
        this.cleanUp();
        this.validate();
        if(!this.errors.length){
            postsCollection.insertOne(this.data).then((info)=>{
                resolve(info.ops[0]._id);
            }).catch(()=>{
                this.errors.push("Please try again later.");
                reject(this.errors);
            });
        }else{
            reject(this.errors);
        }
    });
}

Post.prototype.update = function(){
    return new Promise(async (resolve, reject)=>{
        try{
            let post = await Post.findSingleById(this.resquestedPostId, this.userid);
            if(post.isVisitorOwner){
                let status = await this.actuallyUpdate();
                   resolve(status);
               }else{
                   reject();
               }             
        }catch{
            reject();
        }
    });
}

Post.prototype.actuallyUpdate = function(){
    return new Promise(async (resolve, reject)=> {
        this.cleanUp();
        this.validate();
       if(!this.errors.length){
           await postsCollection.findOneAndUpdate({_id: new ObjectID(this.resquestedPostId)}, {$set: {title: this.data.title, body: this.data.body}});
           resolve('success');
       }else{
           reject('failure');
       }        
    });
}

Post.reuseableQuery = function(uniqeOption, visitorId){
    return new Promise(async function(resolve, reject){
        let aggOptions = uniqeOption.concat([
            {$lookup: {from: 'users', localField: 'author', foreignField: '_id', as: "authorDocument"}},
            {$project: {
                title: 1,
                body: 1,
                createdDate: 1,
                authorId: "$author",
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ]);

        let posts = await postsCollection.aggregate(aggOptions).toArray();

        // clean Up
        posts = posts.map(function(post){
            post.isVisitorOwner = post.authorId.equals(visitorId);
            post.authorId = undefined;

            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post;
        });
        resolve(posts);
    });
}


Post.findSingleById = function(id, visitorId){
    return new Promise(async function(resolve, reject){
        if(typeof(id) != "string" || !ObjectID.isValid(id)){
            reject();
            return
        }
        let posts = await Post.reuseableQuery([
            {$match: {_id: new ObjectID(id)}}
        ], visitorId);

        if(posts.length){
            //console.log(posts[0])
            resolve(posts[0]);
        }else{
            reject();
        }
    });
}

Post.findAuthorId = function(authorId){
    return Post.reuseableQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}
    ]);
}

Post.delete = function(postIdToDelete, currentUserId){
    return new Promise(async (resolve, reject)=>{
        try{
            let post = await Post.findSingleById(postIdToDelete, currentUserId);
            if(post.isVisitorOwner){
                await postsCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
                resolve();
            }else{
                reject();
            }
        }catch{
            reject();
        }
    });
}

Post.search = function(searchTerm){
    return new Promise(async (resolve, reject)=>{
        if(typeof(searchTerm) == 'string'){
            let posts = await Post.reuseableQuery([
                {$match: {$text: {$search: searchTerm}}},
                {$sort: {score: {$meta: 'textScore'}}}
            ]);
            resolve(posts);
        }else{
            reject();
        }
    });
}


Post.countPostsByAuthor = function(id){
    return new Promise(async (resolve, reject) => {
        let postCount = await postsCollection.countDocuments({author: id});
        resolve(postCount);
    });
}

Post.getFeed = async function(id){
    let followedUsers = await followssCollection.find({authorId: new ObjectID(id)}).toArray();
    followedUsers = followedUsers.map(function(followDoc){
        return followDoc.followedId;
    });

    return Post.reuseableQuery([
        {$match: {author: {$in: followedUsers}}},
        {$sort: {createdDate: -1}}
    ])   
}

module.exports = Post;