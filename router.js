let express = require('express');
let router = express.Router();
let userController = require('./controllers/userController');

router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
