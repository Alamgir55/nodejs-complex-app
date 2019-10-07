const Post = require('../models/Post');

exports.viewCreateScreen = function(req, res){
    res.render('create-post');
}

exports.create = function(req, res){
    let post = new Post(req.body, req.session.user._id);
    post.create().then(function(){
        res.send("New Post created.")
    }).catch(function(errors){
        res.send(errors);
    });
}

exports.viewSingle = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id, req.visitorId);
        res.render('single-post-screen', {post: post});
    }catch{
        res.render('404');
    }
}

exports.viewEditScreen = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id);
       if(post.authorId == req.visitorId){
            res.render('edit-post', {post: post});
       }else{
            req.flash('errors', 'You do not have permission to perform this action');
            req.session.save(()=> res.redirect('/'));
       }
    }catch{
        res.render('404');
    }
}

exports.edit = function(req, res){
   let post = new Post(req.body, req.visitorId, req.params.id);
    post.update().then((status) => {
        if(status == 'success'){
            req.flash('success', 'Post successfully updated.');
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`);
            });
        }else{
            post.errors.forEach(error => {
                req.flash('errors', error);
            });
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`);
            });
        }
    }).catch(function(){
        req.flash('errors', 'You do not have permissin to perform that action..');
        req.session.save(function(){
            res.redirect('/');
        });
    });
}