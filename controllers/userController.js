const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const jwt = require('jsonwebtoken');


exports.apiGetPostsByUsername = async function(req, res){
    try{
      let userDoc = await User.findByUsername(req.params.username);
      let posts = await Post.findAuthorId(userDoc._id);
      res.json(posts);
    }catch{
        res.json('You are not allowed.');
    }
}

exports.apiMustBeLoggedIn = function(req, res, next){
    try{
        req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET);
        next();
    }catch{
        res.json('Sorry, must be user');
    }
}

exports.doesEmailExit = async function(req, res){
   let emailBool = await User.doesEmailExit(req.body.email);
   res.json(emailBool);   
}

exports.doesUsernameExit = function(req, res){
    User.findByUsername(req.body.username).then(function(){
        res.json(true);
    }).catch(function(){
        res.json(false);
    })
}

exports.sharedProfileData = async function(req, res, next){
    let isVisiterProfile = false;
    let isFollowing = false;
    if(req.session.user){
        isVisiterProfile = req.profileUser._id.equals(req.session.user._id);
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId);
    }
    req.isVisiterProfile = isVisiterProfile;
    req.isFollowing = isFollowing;

    let postCountPromise = Post.countPostsByAuthor(req.profileUser._id);
    let countFollowersById = Follow.countFollowersById(req.profileUser._id);
    let countFollowingById = Follow.countFollowingById(req.profileUser._id);

    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, countFollowersById, countFollowingById]);

    
    req.postCount = postCount;
    req.followerCount = followerCount;
    req.followingCount = followingCount;

    next();
}

exports.mustBeLoggedIn = function(req, res, next){
    if(req.session.user){
        next();
    }else{
        req.flash("errors", "You must be logged in to perform that action");
        req.session.save(function(){
            res.redirect('/');
        });
    }
}

exports.login = function(req, res){
    let user = new User(req.body);
    user.login().then(function(result){
        req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/');
        });
    }).catch(function(e){
        req.flash('errors', e);
        req.session.save(function(){
            res.redirect('/');
        });
    });
}

exports.apiLogin = function(req, res){
    let user = new User(req.body);
    user.login().then(function(result){
        res.json(jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: '7d'}));
    }).catch(function(e){
        res.json('Sorry, your values are not correct.');
    });
}

exports.logout = function(req, res){
    req.session.destroy(function(){
        res.redirect('/');
    });
}

exports.register = function(req, res){
    let user = new User(req.body);
    user.register().then(()=>{
        req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/');
        });
    }).catch((regErrors)=>{
        regErrors.forEach(function(error){
            req.flash('regErrors', error);
        })
        req.session.save(function(){
            res.redirect('/');
        });
    });
    
}

exports.home = async function(req, res){
    if(req.session.user){
        let posts = await Post.getFeed(req.session.user._id);
        res.render('home-dashboard', {posts: posts});
    }else{
        res.render('home-guest', {regErrors: req.flash('regErrors')});
    }
}

exports.ifUserExits = function(req, res, next){
        User.findByUsername(req.params.username).then(function(userDocument){
            req.profileUser = userDocument;
            next();
        }).catch(function(){
            res.render('404');
        });
}

exports.profilePostScreen = function(req, res){

    Post.findAuthorId(req.profileUser._id).then(function(posts){
        res.render('profile', {
            title: `Profile for ${req.profileUser.username}`,
            currentPage: 'posts',
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisiterProfile: req.isVisiterProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
        });
    }).catch(function(){
        res.render('404');
    });
}

exports.profilefollowersScreen = async function(req, res){
   try{
      // console.log(req.profileUser._id);
        let followers = await Follow.getFollowersById(req.profileUser._id);
        res.render('profile-followers', {
            currentPage: 'followers',
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisiterProfile: req.isVisiterProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    });
   }catch{
        res.render('404');
   }
}

exports.profilefollowingScreen = async function(req, res){
    try{
        let following = await Follow.getFollowingById(req.profileUser._id);
        res.render('profile-following', {
            currentPage: 'following',
            following: following,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisiterProfile: req.isVisiterProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
        });
    }catch{
        res.render('404');
    }
}