const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const followController = require('./controllers/followController');

// User
router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Profile
router.get('/profile/:username', userController.ifUserExits, userController.sharedProfileData, userController.profilePostScreen);
router.get('/profile/:username/followers', userController.ifUserExits, userController.sharedProfileData, userController.profilefollowersScreen);
router.get('/profile/:username/following', userController.ifUserExits, userController.sharedProfileData, userController.profilefollowingScreen);

// Post
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen);
router.post('/create-post', userController.mustBeLoggedIn, postController.create);
router.get('/post/:id', postController.viewSingle);
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen);
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.edit);
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.delete);
router.post('/search', postController.search);

// Follow
router.post('/addfollow/:username', userController.mustBeLoggedIn, followController.addFollow);
router.post('/removefollow/:username', userController.mustBeLoggedIn, followController.removeFollow);

module.exports = router;