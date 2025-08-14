const { Router } = require('express');
const router = Router();
const User = require('../models/user'); // Assuming you have a User model

router.get('/signin', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.matchPasswordAndGenerateToken(email, password);
        // Assuming createTokenForUser is a function that generates a JWT token
        console.log('User signed in successfully:', user);
        res.cookie('token', user).redirect('/');
    } catch (error) {
        console.error('Error signing in:', error);
        return res.render('signin', {
            title: 'Sign In',
            error: error.message
        });
    }
});

router.get('/signout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

router.post('/signup', (req, res) => {
    // Handle sign-up logic here
    const { fullName, email, password } = req.body;
    User.create({ fullName, email, password })
        .then(() => res.redirect('/user/signin'))
        .catch(err => {
            console.error(err);
            res.status(500).send('Error creating user');
        });
});

module.exports = router;