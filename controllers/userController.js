exports.login = function(){

};

exports.logout = function(){

};

exports.register = function(req, res){
    res.send('This is register home page');
};

exports.home = function(req, res){
    res.render('home-guest');
};