const express = require('express');
const auth = require('../middlewares/auth')

const router = express.Router();

const authController  = require('../controller/authController')


router.get('/test', (req, res) => res.json({ msg: "Working !"}));

//user

//register
router.post('/register', authController.register);

//login
router.post('/login', authController.login);
//logout
router.post('/logout', auth, authController.logout);

//refresh
router.get('/refresh', authController.refresh);

//blod CURD
//create
//read all blogs
// blog detail by id
//update
//delete


//comment
// create comment
//read.

module.exports = router;