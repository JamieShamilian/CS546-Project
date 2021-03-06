const loginRoutes = require('./login');
const profileRoutes = require('./profile');
const addPetRoutes = require('./addPet');
const updatePetRoutes = require('./updatePet');
const searchPetRoutes = require('./searchPet');
const selectaPetRoutes = require('./selectaPet');
const selectOrderRoutes = require('./selectOrder');
const addPaymentRoutes = require('./addPayment');
const showOrdersRoutes = require('./showOrders');

const debug = false;
const logDebug = function logDebug(str) {
  if (debug) console.error(str);
};


const constructorMethod = (app) => {
    app.use('/', loginRoutes);
    app.use('/profile', profileRoutes);
    app.use('/addPet', addPetRoutes);
    app.use('/updatePet', updatePetRoutes);
    app.use('/selectaPet', selectaPetRoutes);
    app.use('/selectOrder', selectOrderRoutes);
    app.use('/searchPet', searchPetRoutes);
    app.use('/addPayment', addPaymentRoutes);
    app.use('/showOrders', showOrdersRoutes);

    app.use('*', (req, res) => {
      logDebug("Method "+req.method+" URL "+req.url);
      res.redirect('/');
      //res.sendStatus(404);
    });
	
  };
  
  module.exports = constructorMethod;