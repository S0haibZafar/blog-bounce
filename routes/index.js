const express = require('express');
const auth = require('../middlewares/auth')

const router = express.Router();

const authController  = require('../controller/authController')

const blogController  = require('../controller/blogController')


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
router.post('/blog', auth, blogController.create);
//read all blogs
router.get('/blog/all', auth, blogController.getAll);
// blog detail by id
// router.get('/blog/:id', auth, blogController.getById);
//update
// router.put('/blog', auth, blogController.update);
//delete
// router.delete('/blog/:id', auth, blogController.delete);


//comment
// create comment
//read.

module.exports = router;