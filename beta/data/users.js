const { ObjectId } = require("mongodb");
const mongoCollections = require("../config/mongoCollections");
const usersCol = mongoCollections.users;
const validation = require('../validation');

const bcrypt = require("bcryptjs");

const salt = 16;

const debug = true;
const logDebug = function logDebug(str) {
  if (debug) console.error(str);
};


function logit(str) {
  console.log("[" + new Date().toUTCString() + "]: " + str);
}

async function checkuserId(userId) {

  let found = false;
  userId = userId.toLowerCase();

  if (userId.search(/^[a-z0-9]{4,}$/) < 0)
    throw "userId Illegal chars or Not long enough";

  const usersCollection = await usersCol();
  let user = await usersCollection
    .find({}, { projection: { _id: 1, userId: 1 } })
    .toArray();
  user.forEach((element) => {
    if (element.userId == userId) found = true;
  });

  return found;
}

async function createUser(userId, passWord) {
  userId = userId.toLowerCase();

  if (userId.search(/^[a-z0-9]{4,}$/) < 0)
    throw "userId Illegal chars or Not long enough";

  if (userId.search(/\s/) >= 0) throw "Password has spaces";

  if (passWord.length < 6) throw "Password not long enough";

  if (checkuserId(userId) == true) throw "Name in Use Already";

  let hashPass = await bcrypt.hash(passWord, salt);

  const newUserDb = {
    userId: userId,
    password: hashPass,
    paymentArray: [],
    orderArray: [],
    favorites: []
  };


  const userCollection = await usersCol();
  const insertInfo = await userCollection.insertOne(newUserDb);
  if (insertInfo.insertedCount === 0) {
    throw "Failed to create " + newUserDb;
  }

  logDebug(" user created is true " + userId);

  return { userInserted: true };
}

async function checkUser(userId, passWord) {
  let userMatch = {};
  let found = false;
  userId = userId.toLowerCase();

  logDebug("checkUser "  + userId);

  if (userId.search(/^[a-z0-9]{4,}$/) < 0)
    throw "userId Illegal chars or Not long enough";

  const usersCollection = await usersCol();
  let user = await usersCollection.find({}, { projection: { _id: 1, userId: 1 , password: 1} }).toArray();
  user.forEach((element) => {
    if (element.userId == userId) { 
      userMatch.userId = element.userId;
      userMatch.password = element.password;
      found = true;
    }
  });

  if (found == false) throw "Can not find user";

  let compareToMatch = false;
  logDebug("Check pass " + passWord);
  logDebug(userMatch);

  let itMatches = false;
  try {
    logDebug(" check passwd "+ passWord + " ", userMatch.password);
    itMatches = await bcrypt.compare(passWord, userMatch.password);
    if (itMatches) logDebug("They match ");
    else {
      logDebug( " failed match " + passWord + " to " + userMatch.clear + " " + userMatch.password );
      throw "Failed password match"
    }
  } catch (e) {
    logDebug( "Error Check user ...  (Non-Authenticated User)" );
    throw "Either the userId or password is invalid";
  }

  return { authenticated: true };
}

async function getUser(userId) {
  let userMatch = {};
  let found = false;
  userId = userId.toLowerCase();

  logDebug("checkUser");

  if (userId.search(/^[a-z0-9]{4,}$/) < 0)
    throw "userId Illegal chars or Not long enough";


  const usersCollection = await usersCol();
  let query = { userId: userId };
  logDebug( query );
  let proj = { 
      _id: 1, 
      userId: 1, 
      firstName: 1,
      lastName: 1,
      email: 1  ,
      age: 1,
      mobilePhone: 1  ,
      streetAddress: 1  ,
      city: 1 ,
      state: 1  ,
      zipcode: 1,
      orderArray: 1
      }

  let user = await usersCollection.find( query, { projection: proj  }).toArray();
  user.forEach((element) => {
    if (element.userId == userId) { 
      userMatch.userId = element.userId;
      userMatch.firstName  = element.firstName ;
      userMatch.lastName  = element.lastName ;
      userMatch.email  = element.email ;
      userMatch.mobilePhone  = element.mobilePhone ;
      userMatch.streetAddress  = element.streetAddress ;
      userMatch.city  = element.city ;
      userMatch.state  = element.state ;
      userMatch.zipcode  = element.zipcode ;
      userMatch.age  = element.age ;
      userMatch.orderArray  = element.orderArray ;
      found = true;
      logDebug(element);
    }
  });

  if (found == false) throw "Can not find user";

  let compareToMatch = false;
  logDebug(userMatch);

  let rtn = {
    userId: userMatch.userId,
    firstName: userMatch.firstName  ,
    lastName:userMatch.lastName  ,
    email:userMatch.email  ,
    mobilePhone:userMatch.mobilePhone  ,
    streetAddress:userMatch.streetAddress  ,
    city:userMatch.city  ,
    state:userMatch.state  ,
    zipcode:userMatch.zipcode  ,
    age:userMatch.age,
    orderArray:userMatch.orderArray,
    authenticated: true
    }

  return rtn ;
}

async function createUser(userId, passWord) {
  userId = userId.toLowerCase();

  if (userId.search(/^[a-z0-9]{4,}$/) < 0)
    throw "userId Illegal chars or Not long enough";

  if (userId.search(/\s/) >= 0) throw "Password has spaces";

  if (passWord.length < 6) throw "Password not long enough";

  if (checkuserId(userId) == true) throw "Name in Use Already";

  let hashPass = await bcrypt.hash(passWord, salt);

  const newUserDb = {
    userId: userId,
    password: hashPass
  };


  const userCollection = await usersCol();
  const insertInfo = await userCollection.insertOne(newUserDb);
  if (insertInfo.insertedCount === 0) {
    throw "Failed to create " + newUserDb;
  }

  logDebug(" user created is true " + userId);

  return { userInserted: true };
}

async function setUser( up ) {
  let userMatch = {};
  let found = false;
  let userId = up.userId.toLowerCase();
  //let userId = up.userId;

  logDebug("checkUser");

  if (userId.search(/^[a-z0-9]{4,}$/) < 0)
    throw "userId Illegal chars or Not long enough";

    up.firstName=validation.checkFirstName(up.firstName);
    up.lastName=validation.checkLastName(up.lastName);
    up.age=validation.checkAge(up.age);
    up.streetAddress=validation.checkStreet(up.streetAddress);
    up.city=validation.checkCity(up.city);
    up.state=validation.checkState(up.state);
    up.zipcode=validation.checkZipcode(up.zipcode);
    up.mobilePhone=validation.checkPhoneNumber(up.mobilePhone);
    up.email = validation.checkEmail(up.email);

    const newUser = {
      firstName: up.firstName,
      lastName : up.lastName,
      email : up.email,
      mobilePhone : up.mobilePhone,
      streetAddress : up.streetAddress,
      city: up.city,
      state: up.state,
      zipcode: up.zipcode,
      orderArray: up.orderArray,
      age: up.age
    };

  const usersCollection = await usersCol();
  let user = await usersCollection.find({}, { projection: { _id: 1, userId: 1 , firstName:1, lastName: 1 } }).toArray();
  user.forEach((element) => {
    if (element.userId == userId) { 
      userMatch.userId = element.userId;
      //userMatch.password = element.password;
      userMatch._id = element._id;
      found = true;
    }
  });

  let updateInfo;
  try {
    updateInfo = await usersCollection.updateOne( { _id: userMatch._id },{ $set:  newUser } );
    logDebug(updateInfo);
    } catch (e) {
    // if (updateInfo.insertedCount === 0) {
        logDebug("updateone failed");
        logDebug(updateInfo);
        throw "Failed to update "+ userId;
    }

  if (found == false) throw "Can not find user";

  let compareToMatch = false;
  logDebug(userMatch);

  let itMatches = false;
  return { authenticated: true };
}

async function orderUser(userId, transId) {
  
  let rtn = await getUser(userId);
  if ( Array.isArray( rtn.orderArray ) == false ) 
    rtn.orderArray = [];
  if ( transId != 0 ) {
    rtn.orderArray.push(transId);
    let rtn2 = await setUser(rtn);
  }
  
  return ( rtn.orderArray );

}


module.exports = {
  checkUser,
  createUser,
  getUser,
  setUser,
  orderUser
};
