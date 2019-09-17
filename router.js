let express = require('express');
let router = express.Router();
let userController = require('./controllers/userController');

router.get('/', function(req, res){
    res.render('home-guest');
});

router.get('/about', userController.home);

router.post('/register', userController.register);

module.exports = router;
