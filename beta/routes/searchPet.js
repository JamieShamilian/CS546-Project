const express = require('express');
const router = express.Router();
const pets = require('../data/pets');

const debug = true;
const logDebug = function logDebug(str) {
  if (debug) console.error(str);
};

function logit( str )
{
    //console.log('[' + new Date().toUTCString() + ']: ' + str );
}

router.get('/', async (req, res) => {
    let petId = req.session.petId;
    let rb = req.body;

    logDebug("user is set to "+req.session.user);
    let errorMsg = "Search Pet page"
    if ( (req.session.user) ) { // user is authenticated
        logit(req.method + ' ' + req.originalUrl + ' (Authenticated User)')
    } else { // user is not authenticated
        logit(req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        errorMsg = "Please login as user admin ";
        res.status(200).render('../views/pages/login', { error1: errorMsg });
        return;
    }

    let rtn = {}
   // let rtn = await pets.searchPets(rb);
   
    rtn.error1 = errorMsg;
    res.status(200).render('../views/pages/searchPet', rtn);

});

router.post('/', async (req, res) => {
    let petId = req.body.petId;
    let petName = req.body.petName;
    let rb = req.body;

    logDebug( " Got "+ petId + " " + petName );

    logDebug("user is set to "+req.session.user);
    let errorMsg = "Search Pet page"
    if ( (req.session.user) ) { // user is authenticated
        logit(req.method + ' ' + req.originalUrl + ' (Authenticated User)')
    } else { // user is not authenticated
        logit(req.method + ' ' + req.originalUrl + ' (Non-Authenticated User)')
        errorMsg = "Please login as user admin ";
        res.status(200).render('../views/pages/login', { error1: errorMsg });
        return;
    }


    rtn = {};
    rtn.error1 = "Select pet list";
    let searchArray = await pets.searchPets(rb);
    if (searchArray.length == 0 ) {
        rtn.error1 = "Select Pet List = No pets of that type";
        rtn.petSearchArray = [];
    } else
        rtn.petSearchArray = searchArray;

    logDebug(" pet select is true  "+ rtn);

    if ( (req.session.user) && (req.session.user == "admin") ) { // user is authenticated
        res.status(200).render('../views/pages/updatePetList', rtn);
    } else {
        res.status(200).render('../views/pages/selectPetList', rtn);
    }
    return;


});


module.exports = router;
