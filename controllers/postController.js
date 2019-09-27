let Post = require('../models/Post');
exports.viewCreateScreen = function(req, res){
    res.render('create-post');
}
exports.create = function(req, res){
    let post = new Post(req.body, req.session._id);
    post.create().then(function(){
        res.send('Post has been Created');
    }).catch(function(error){
        res.send(error);
    }); 
}
exports.viewSingle = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id);
        res.render('post-single-screen', {post: post});
    }catch{
        res.render('404');
    }
}