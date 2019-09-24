let express = require('express');
let router = express.Router();
let userController = require('./controllers/userController');
let postController = require('./controllers/postController');

router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen);

module.exports = router;
