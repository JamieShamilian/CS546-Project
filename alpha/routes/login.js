const express = require('express');
const router = express.Router();
const users = require('../data/users');
const bcrypt = require('bcryptjs');


const debug = false;
const logDebug = function logDebug(str) {
  if (debug) console.error(str);
};

function logit( str )
{
    //console.log('[' + new Date().toUTCString() + ']: ' + str );
}


router.get('/', (req, res) => {
    logDebug("user is set to "+req.session.user);
    if (req.session.user) { // user is authenticated
        logit(req.method + ' ' + req.originalUrl + ' (Authenticated User)')
        res.redirect('/private'); 
    } else { // user is not authenticated
        logit(req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        errorMsg = "Please login ";
        res.status(200).render('../views/pages/login', { error1: errorMsg });
       // return;
    }
});

router.post('/', async (req, res) => {
    logDebug(" / post called")
    res.json({route: '/users', method: req.method});
  });


router.post('/login', async (req, res) => {
    let userId = req.body.userId;
    let passWord = req.body.password;

    try {

        let rtn = await users.checkUser (userId, passWord );
     
        if ( rtn.authenticated == true ) {
            logDebug( "Pass OK " + req.method + ' ' + req.originalUrl + ' (Authenticated User)')
            // set the user to userId from userMatch
            req.session.user = userId;
            res.redirect('/private');
            return;
        } else {
            logDebug( "Pass failed " + req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
            errorMsg = "Login failed userId and/or password try again";
            res.status(400).render('../views/pages/login', { error1: errorMsg });
            return;
        }
    } catch (e) {
        logDebug( "Catch1 Error "+ req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        errorMsg = "Login failed try again";
        //res.status(400).render('../views/pages/login', { error1 : errorMsg });
        res.status(400).render('../views/pages/login', { error1: e });
        return;
    }
});

router.get('/signup', (req, res) => {
    logDebug("user is set to "+req.session.user);
    if (req.session.user) { // user is authenticated
        logit( req.method + ' ' + req.originalUrl + ' (Authenticated User)')
        res.redirect('/private'); 
    } else { // user is not authenticated
        logit( req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        // error = "Please log in with valid credentials.";
        res.status(200).render('../views/pages/signup', {});
        return;
    }
});


router.post('/signup', async (req, res) => {
    let userId = req.body.userId;
    let passWord = req.body.password;

    logDebug("look for "+ userId);

    try {

        let rtn = await users.createUser (userId, passWord );
        if ( rtn.userInserted == true ) {
            logDebug( "Pass OK " + req.method + ' ' + req.originalUrl + ' (Authenticated User)')
            // set the user to userId from userMatch
            //req.session.user = userId;
            res.redirect('/');
            return;
        } else {
            logDebug( "Pass failed " + req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
            errorMsg = "Internal Server Error";
            res.status(500).render('../views/pages/signup', { error1: errorMsg });
            return;
        }
    } catch (e) {
        logDebug( "Catch2 Error "+ req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        errorMsg = "Login failed try again";
        //res.status(400).render('../views/pages/signup', { error1 : errorMsg });
        res.status(400).render('../views/pages/signup', { error1 : e });
        return;
    }


});


router.get('/private', (req, res) => {
    const user = req.session.user;
    if ( user ) {
        logit( req.method + ' ' + req.originalUrl + ' (Authenticated User)')
        res.status(200).render('../views/pages/auth', { userId: user });
    } else {
        logit( req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        errorMsg = "Login failed try again";
        res.status(403).render('../views/pages/login', { error1 : errorMsg });
        return;
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    logit(req.method + ' ' + req.originalUrl + ' (Authenticated User)')
    res.render('../views/pages/logout',  {});
    return;
});



module.exports = router;