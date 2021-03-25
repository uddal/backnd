const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://eagl:indra1234@cluster0-o0cyu.mongodb.net/test';

// Database Name
const dbName = 'predis';

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
  if(err){console.log('cant connect to db',err)}
  assert.equal(null, err);
  console.log("Connected successfully to server");
   db = client.db(dbName);

});


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var notp = require('notp');
var jwt = require('jsonwebtoken');
var dbOperations = require('./dboperations');



app.get('/', function(req, res) {
   res.sendfile('field.html');
});

var users = [];
var userMap = {};
var usersBySocket = {};
var bikeMech = [];
var bikeMechMap = {}
var bikeMechBySocket = {};
var carMech = [];
var carMechMap = {};
var carMechBySocket = {};
var operators = [];
var operatorMap = {};
var operatorBySocket = {};
var bikeRequestMap = {};
var bikeRequestByUser = {};
var bikeRequestByMech = {};
var carRequestMap = {};
var carRequestByUser = {};
var carRequestByMech = {};
var carRequestByOper = {};
var socketToTypeMap = {};

io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('sendUserOTP', function(data) {
     if(data&&(typeof data.phone === 'string')){
      console.log(data);


var key = data.phone;
var token = notp.totp.gen(key,{time:120});
console.log('otp generated:',token);


      if(users.indexOf(data.phone) > -1) {
         socket.emit('userExists',{ phone:data.phone});
      } else {

         socket.emit('userSet',{ phone:data.phone});
      }}
   });

   socket.on('verifyUserOtp', function(data){
     if(data.otp&&data.phone&&(typeof data.phone === 'string')){
     // Check TOTP is correct (HOTP if hotp pass type)
     var login = notp.totp.verify(data.otp, data.phone, {time:120});
     // invalid token if login is null

     if (login) {
       users.push(data.phone);
       console.log('Token valid, sync value is %s', login.delta);
       socket.emit('userOtpVerified');}else{
         return console.log('Token invalid');
         socket.emit('userOtpInvalid');
     }

     var jtoken = jwt.sign({id:data.name, key:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});
     console.log('jsonwebtoken created:',jtoken);

     dbOperations.saveUser(db, data.name, data.location, data.phone, jtoken, function(results) {console.log(results.ops);});
     console.log(data.name, ' is added to the users collection');

     userMap[data.phone] = socket.id;
     usersBySocket[socket.id] = data.phone;
     socketToTypeMap[socket.id] = 'U';

     socket.emit('saveUserToken',{jwt:jtoken});
     console.log('user socket: ', socket.id);}else(console.log("invalid data on verify otp"));
   });

   socket.on('sendBikeMechOTP', function(data) {
     if(data&&(typeof data.phone === 'string')){
      console.log(data);


     var key = data.phone;
     var token = notp.totp.gen(key,{time:120});
     console.log('otp generated:',token);


      if(bikeMech.indexOf(data.phone) > -1) {
         socket.emit('bikeMechExists',{ phone:data.phone});
      } else {

         socket.emit('bikeMechSet',{ phone:data.phone});
      }}
   });

   socket.on('verifyBikeMechOtp', function(data){
     if(data.otp&&data.phone&&(typeof data.phone === 'string')){
     // Check TOTP is correct (HOTP if hotp pass type)
     var login = notp.totp.verify(data.otp, data.phone, {time:120});

     // invalid token if login is null
     if (login) {
       bikeMech.push(data.phone);
       console.log('Token valid, sync value is %s', login.delta);
       socket.emit('bikeMechOtpVerified');}else{
         return console.log('Token invalid');
         socket.emit('bikeMechOtpInvalid');
     }


     var jtoken = jwt.sign({id:data.name, key:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});
     console.log('jsonwebtoken created:',jtoken);

     dbOperations.saveBikeMech(db, data.name, data.location, data.phone, jtoken, function(results) {console.log(results.ops);});
     console.log(data.name, ' is added to the bikemech collection');

     bikeMechMap[data.phone] = socket.id;
     bikeMechBySocket[socket.id] = data.phone;
     socketToTypeMap[socket.id] = 'BM';

     socket.emit('saveBikeMechToken',{jwt:jtoken});
    console.log('bikeMech socket: ', socket.id);}else(console.log("invalid data on verify otp"));
   });

   socket.on('sendCarMechOTP', function(data) {
     if(data&&(typeof data.phone === 'string')){
      console.log(data);


var key = data.phone;
var token = notp.totp.gen(key,{time:120});
console.log('otp generated:',token);


      if(carMech.indexOf(data.phone) > -1) {
         socket.emit('carMechExists',{ phone:data.phone});
      } else {

         socket.emit('carMechSet',{ phone:data.phone});
      }}
   });

   socket.on('verifyCarMechOtp', function(data){
     if(data.otp&&data.phone&&(typeof data.phone === 'string')){
     // Check TOTP is correct (HOTP if hotp pass type)
     var login = notp.totp.verify(data.otp, data.phone, {time:120});

     // invalid token if login is null
     if (login) {
       carMech.push(data.phone);
     console.log('token valid');}else{
         return console.log('Token invalid');
         socket.emit('carMechOtpInvalid');
     }

     // valid token
     console.log('Token valid, sync value is %s', login.delta);
     socket.emit('carMechOtpVerified');

     var jtoken = jwt.sign({id:data.name, key:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});
     console.log('jsonwebtoken created:',jtoken);

     dbOperations.saveCarMech(db, data.name, data.location, data.phone, jtoken, function(results) {console.log(results.ops);});
     console.log(data.name, ' is added to the carMech collection');

     carMechMap[data.phone] = socket.id;
     carMechBySocket[socket.id] = data.phone;
     socketToTypeMap[socket.id] = 'CM';

     socket.emit('saveCarMechToken',{jwt:jtoken});}else(console.log("invalid data on verify otp"));
   });

   socket.on('sendOperOTP', function(data) {
     if(data&&(typeof data.phone === 'string')){
      console.log(data);


var key = data.phone;
var token = notp.totp.gen(key,{time:120});
console.log('otp generated:',token);


      if(operators.indexOf(data.phone) > -1) {
         socket.emit('operatorExists',{ phone:data.phone});
      } else {
         socket.emit('operatorSet',{ phone:data.phone});
      }}
   });

   socket.on('verifyOperOtp', function(data){
     if(data.otp&&data.phone&&(typeof data.phone === 'string')){
     // Check TOTP is correct (HOTP if hotp pass type)
     var login = notp.totp.verify(data.otp, data.phone, {time:120});

     // invalid token if login is null
     if (login) {
       operators.push(data.phone);
     console.log('token valid');}else{
         return console.log('Token invalid');
         socket.emit('operOtpInvalid');
     }

     // valid token
     console.log('Token valid, sync value is %s', login.delta);
     socket.emit('operOtpVerified');

     var jtoken = jwt.sign({id:data.name, key:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});
     console.log('jsonwebtoken created:',jtoken);

     dbOperations.saveOperator(db, data.name, data.location, data.phone, jtoken, function(results) {console.log(results.ops);});
     console.log(data.name, ' is added to the operators collection');

     operatorMap[data.phone] = socket.id;
     operatorBySocket[socket.id] = data.phone;
     socketToTypeMap[socket.id] = 'O';

     socket.emit('saveOperToken',{jwt:jtoken});}else(console.log("invalid data on verify otp"));
   });

   socket.on('userAuth', function(data){//ToDo:update socket to phone maps
     if(data.jwt){
     var decoded = jwt.verify(data.jwt,'741852963skr');
     console.log('jtoken verified',decoded);
     dbOperations.getUserProfile(db, decoded.key, function(results) {
       console.log(results);
       if(results){socket.emit('userProfile',results);}
       else socket.emit('invalidUserLogin');
     });
   }else{console.log("invalid data on authorize");}
 });

   socket.on('bikeMechAuth', function(data){
     if(data.jwt){
     var decoded = jwt.verify(data.jwt,'741852963skr');
     console.log('jtoken verified',decoded);
     dbOperations.getBikeMechProfile(db, decoded.key, function(results) {
       console.log(results);
       if(results){socket.emit('bikeMechProfile',results);}
       else socket.emit('invalidBikeMechLogin');
     });
   }else{console.log("invalid data on authorize");}
 });

 socket.on('carMechAuth', function(data){
   if(data.jwt){
   var decoded = jwt.verify(data.jwt,'741852963skr');
   console.log('jtoken verified',decoded);
   dbOperations.getCarMechProfile(db, decoded.key, function(results) {
     console.log(results);
     if(results){socket.emit('carMechProfile',results);}
     else socket.emit('invalidCarMechLogin');
   });
 }else{console.log("invalid data on authorize");}
});

socket.on('operAuth', function(data){
  if(data.jwt){
  var decoded = jwt.verify(data.jwt,'741852963skr');
  console.log('jtoken verified',decoded);
  dbOperations.getOperProfile(db, decoded.key, function(results) {
    console.log(results);
    if(results){socket.emit('operProfile',results);}
    else socket.emit('invalidOperLogin');
  });
}else{console.log("invalid data on authorize");}
});

socket.on('disconnect', function() {
  console.log('user disconnected: ', socket.id);
  var tag = socketToTypeMap[socket.id];
  switch (tag) {
    case 'U':
     var index = users.indexOf(usersBySocket[socket.id]);
     if (index > -1) {
        users.splice(index, 1);
        console.log('user is offline: ',usersBySocket[socket.id]);
        delete userMap[usersBySocket[socket.id]];
        delete usersBySocket[socket.id];
        delete socketToTypeMap[socket.id];
      }
    break;
    case 'BM':
     console.log('mechanic disconnected: ', socket.id);
     var index = bikeMech.indexOf(bikeMechBySocket[socket.id]);
     console.log('index: ',index);
     var ph = bikeMechBySocket[socket.id];
     //console.log('ph: ',ph);
     if (index > -1) {
        bikeMech.splice(index, 1);
        console.log('bikeMech arrayDelete');
        dbOperations.bikeMechOffline(db, ph, function(results){
          console.log('bikeMech is offline: ', bikeMechBySocket[socket.id]);
        });
        delete bikeMechMap[bikeMechBySocket[socket.id]];
        delete bikeMechBySocket[socket.id];
        delete socketToTypeMap[socket.id];
      }
    break;
    case 'CM':
    var index = carMech.indexOf(carMechBySocket[socket.id]);
    var ph = bikeMechBySocket[socket.id];
    if (index > -1) {
       carMech.splice(index, 1);
       dbOperations.carMechOffline(db, ph, function(results){
         console.log('carMech is offline: ', carMechBySocket[socket.id]);
       });
       delete carMechMap[carMechBySocket[socket.id]];
       delete carMechBySocket[socket.id];
       delete socketToTypeMap[socket.id];
     }
    break;
    case 'O':
    var index = operators.indexOf(operatorBySocket[socket.id]);
    if (index > -1) {
       operators.splice(index, 1);
       console.log('operator is offline: ', operatorBySocket[socket.id]);
       delete operatorMap[operatorBySocket[socket.id]];
       delete operatorBySocket[socket.id];
       delete socketToTypeMap[socket.id];
     }
}
     });

   socket.on('nearestCarMech', function(data){  //admin
     if(data.location&&data.jwt){
     //console.log(data);
     var loc = data.location.map(Number);
     //console.log(loc);
     var decoded = jwt.verify(data.jwt,'741852963skr');

     dbOperations.fetchCarMech(db, loc, function(results){
       console.log('fetched mech collection: ',results);
       socket.emit('carMechMapView', results);
     });}else{console.log("invalid data nearest car mech");}
     //socket.emit('repairRequest', result);
   });

   socket.on('nearestBikeMech', function(data){  //admin
    if(data.location&&data.jwt){
    //console.log(data);
    var loc = data.location.map(Number);

    var decoded = jwt.verify(data.jwt,'741852963skr');

    dbOperations.fetchBikeMech(db, loc, function(results){
      console.log('fetched mech collection: ',results);
      socket.emit('bikeMechMapView', results);

    });}else{console.log("invalid data nearest bike mech");}
 });


   socket.on('schedCarReq', function(data) {
     if(data.location&&data.jwt){
     var loc = data.location.map(Number);

     var decoded = jwt.verify(data.jwt,'741852963skr');

     var ObjectID = require('mongodb').ObjectID;
     var requestId = new ObjectID;

     carRequestByUser[requestId] = socket.id; //????

     dbOperations.saveShedCarReq(db, requestId, decoded.id, decoded.key, loc, function(results){
       console.log('sheduled carRequest saved');
     });

     socket.emit('carReqSched');
   }else{console.log("invalid data scheduled car request");}

   });

   socket.on('schedBikeReq', function(data) {
     dbOperations.saveSchedBikeReq(db, data, function(results){
       console.log(results);
       //setTimeout function
       socket.emit('bikeReqSched');
     });
   });

   socket.on('bookCar', function(data){
    if(data.location&&data.jwt){
    var loc = data.location.map(Number);

    var decoded = jwt.verify(data.jwt,'741852963skr');

    var ObjectID = require('mongodb').ObjectID;
    var requestId = new ObjectID;

    carRequestByUser[requestId] = socket.id; //ToDo : connect through phone mapping(avoids mismatch after reconnecting)

    dbOperations.saveCarRequest(db, requestId, decoded.id, decoded.key, loc, data.type, function(results){
      console.log('carRequest saved');
    });

    socket.to(operatorMap[operators[0]]).emit('connectOperator',{name:decoded.id, phone:decoded.key, location:loc, requestId:requestId}); //admin

    /*dbOperations.fetchCarMech(db, loc, function(results){
      console.log('fetched carMech collection: ',results);
      //socket.emit('bikeMechList', results);

      if(Object.keys(results).length > 0){
      socket.to(carMechMap[results[0].phone]).emit('carRepairRequest',{requestId:requestId, location:loc});//getUserProfile
      socket.emit('carRequestPlaced');
      console.log('request sent to: ', results[0].phone);
      console.log('mech socket: ', carMechMap[results[0].phone]);

      setTimeout(function() {
                 if(carRequestMap[requestId]!=1){
                   if(results[1]){socket.to(carMechMap[results[1].phone]).emit('carRepairRequest',{requestId:requestId, location:loc});
               console.log('request sent to: ', results[1].phone);}else{console.log('only one mechanic is available');}}
                }, 20000);
              setTimeout(function() {
                         if(carRequestMap[requestId]!=1){
                           if(results[2]){socket.to(carMechMap[results[2].phone]).emit('carRepairRequest',{requestId:requestId, location:loc});
                       console.log('request sent to: ', results[2].phone);}else{console.log('only one mechanic is available');}}
                        }, 40000);}else{console.log('no mechanics around');
                              socket.emit('noCarMechAround');}
    }); automatching */
  }else{console.log("invalid data nearest car mech");}
 });

 socket.on('assign', function(data){ //admin
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   carRequestByOper[requestId] = socket.id;
   socket.to(carMechMap[data.phone]).emit('carRequest', {requestId:data.requestId, location:data.loc});
   socket.emit('assigned');
 });

 socket.on('carRqstAccptd',function(data){

   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   //console.log(requestid);
   if(!carRequestMap[requestId]){
   carRequestMap[requestId] = 1;
   console.log('request accepted of id: ', requestId);
   carRequestByMech[socket.id] = requestId;

   dbOperations.carRequestUpdate(db, requestId, 'engagaed', carMechBySocket[socket.id], function(results){
     console.log('results');
   });
  console.log('carRequests collection updated');
  socket.emit('carRqstConfirm');

  dbOperations.createCarInspection(db, requestId, carMechBySocket[socket.id], function(results){
    console.log('results');
  });
 console.log('inspection collection created');

  dbOperations.carMechUpdate(db, carMechBySocket[socket.id],  function(results){
    console.log('results');
  });
 console.log('mechanic status updated');

 dbOperations.getCarMechProfile(db, carMechBySocket[socket.id],  function(results){
   console.log(results.ops);
   socket.to(carRequestByUser[requestId]).emit('inform',{results:results});
   socket.to(carRequestByOper[requestId]).emit('informOp');
   //admin
 });
 }else{console.log("request already accepted");}
 });


 var results = {};
 async function addAsync(location){
 results[0] = await dbOperations.fetchShp(db, location, function(shp){
   console.log('shp'); });
 results[1] = await dbOperations.fetchShs(db, location, function(shs){
   console.log(shs); });
 results[2] = await dbOperations.fetchChp(db, location, function(chp){
   console.log(chp); });
 results[3] = await dbOperations.fetchChs(db, location, function(chs){
   console.log(chs); });
 return results;
 //console.log(results);
 }
   socket.on('fetchCarRequests', function(data) {
     //console.log(data.location);

   addAsync(data.location).then((results) => {
     console.log('async: ','results');
     socket.emit('carRequestsMV', {results:results}); });
   });

   /*socket.on('getCarRequests', function(data) {
     //console.log(data.location);

   addAsync(data.location).then((results) => {
     console.log('async: ',results);
     socket.emit('carRequestsLV', {results:results}); });
   });*/

   socket.on('getShpRequests', function(data) {
     dbOperations.getShp(db, data.location, function(results){
       console.log('shp: ',results);
     socket.emit('shpRequests', {results:results}); });
   });

   socket.on('getShsRequests', function(data) {
     dbOperations.getShs(db, data.location, function(results){
       console.log('shs: ',results);
     socket.emit('shsRequests', {results:results}); });
   });

   socket.on('getChpRequests', function(data) {
     dbOperations.getChp(db, data.location, function(results){
       console.log('chp: ',results);
     socket.emit('chpRequests', {results:results}); });
   });

   socket.on('getChsRequests', function(data) {
     dbOperations.getChs(db, data.location, function(results){
       console.log('chs: ',results);
     socket.emit('chsRequests', {results:results}); });
   });

   socket.on('getOnlineCarMechs', function(data){
     dbOperations.getOnlineCarMechs(db, function(results){
       console.log(results);
       socket.emit('onlineCarMechs',{results:results});
     });
   });


   socket.on('bookBike', function(data){
    if(data.location&&data.jwt){
    //console.log(data);
    var loc = data.location.map(Number);

    var decoded = jwt.verify(data.jwt,'741852963skr');

    var ObjectID = require('mongodb').ObjectID;
    var requestId = new ObjectID;

    bikeRequestByUser[requestId] = socket.id;

    dbOperations.saveBikeRequest(db, requestId, decoded.id, decoded.key, loc, function(results){
      console.log('bikeRequest saved');
    });

    dbOperations.fetchBikeMech(db, loc, function(results){
      console.log('fetched bikeMech collection: ',results);
      //socket.emit('bikeMechList', results);

      if(Object.keys(results).length > 0){
      socket.to(bikeMechMap[results[0].phone]).emit('bikeRepairRequest',{requestId:requestId, location:loc});//getUserProfile
      socket.emit('bikeRequestPlaced');
      console.log('request sent to: ', results[0].phone);
      console.log('mech socket: ', bikeMechMap[results[0].phone]);

      setTimeout(function() {
                 if(bikeRequestMap[requestId]!=1){
                   if(results[1]){socket.to(bikeMechMap[results[1].phone]).emit('bikeRepairRequest',{requestId:requestId, location:loc});
               console.log('request sent to: ', results[1].phone);}else{console.log('only one mechanic is available');}}
                }, 20000);
              setTimeout(function() {
                         if(bikeRequestMap[requestId]!=1){
                           if(results[2]){socket.to(bikeMechMap[results[2].phone]).emit('bikeRepairRequest',{requestId:requestId, location:loc});
                       console.log('request sent to: ', results[2].phone);}else{console.log('only one mechanic is available');}}
                        }, 40000);}else{console.log('no mechanics around');
                              socket.emit('noBikeMechAround');}
    });}else{console.log("invalid data nearest bike mech");}
 });//two more emit events

 socket.on('bikeRqstAccptd',function(data){

   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   //console.log(requestid);
   if(!bikeRequestMap[requestId]){
   bikeRequestMap[requestId] = 1;
   console.log('request accepted of id: ', requestId);
   bikeRequestByMech[socket.id] = requestId;

   dbOperations.bikeRequestUpdate(db, requestId, 'engagaed', bikeMechBySocket[socket.id], function(results){
     console.log('results');
   });
  console.log('bikeRequests collection updated');
  socket.emit('bikeRqstConfirm');

  dbOperations.saveBikeInspection(db, requestId, bikeMechBySocket[socket.id], function(results){
    console.log('results');
  });
 console.log('inspection collection created');

  dbOperations.bikeMechUpdate(db, bikeMechBySocket[socket.id],  function(results){
    console.log('results');
  });
 console.log('mechanic status updated');

 dbOperations.getBikeMechProfile(db, bikeMechBySocket[socket.id],  function(results){
   console.log(results.ops);
   socket.to(bikeRequestByUser[requestId]).emit('intimate',{results:results});
 });
 }else{console.log("request already accepted");}
 });

 socket.on('updateBikeMechLoc', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   dbOperations.updateBikeMechLoc(db, decoded.key, data.loc, function(results){
     console.log(results.ops);
   });
   requestId = bikeRequestByMech[socket.id];
   if(bikeRequestMap[requestId]){socket.to(bikeRequestByUser[requestId]).emit('sendBikeMechLoc', {location:data.location});} //requestId to user map
 });

 socket.on('updateCarMechLoc', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   dbOperations.updateCarMechLoc(db, decoded.key, data.loc, function(results){
     console.log(results.ops);
   });
   requestId = carRequestByMech[socket.id];
   if(carRequestMap[requestId]){socket.to(carRequestByUser[requestId]).emit('sendCarMechLoc', {location:data.location});}
 });

 socket.on('bikeInsStart', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.updateBikeInsStatus(db, decoded.key, function(results){
     console.log('results');
     socket.to(bikeRequestByUser[requestId]).emit('bikeInsStarted');
     socket.emit('is');
   });
 });

 socket.on('bikeInsEnd', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.saveBikeJobcard(db, requestId, data.image, function(results){
     console.log('results');
     socket.to(bikeRequestByUser[requestId]).emit('bikeInsCompleted',{image:data.image});
     socket.emit('ie');
   });
 });

 socket.on('fetchSpare', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   dbOperations.fetchAutoShop(db, data.location, 3000, function(results){
     console.log('results');
     socket.emit('autoShop', results);
   });
 });

 socket.on('fetchMoreSpare', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   dbOperations.fetchMoreAutoShop(db, data.location, 3000, 6000, function(results){
     console.log('results');
     socket.emit('moreAutoShop', results);
   });
 });

 socket.on('boughtSpare', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.saveSpareBill(db, requestId, data.image, function(results){
     console.log('results');
     socket.to(bikeRequestByUser[requestId]).emit('spareBought',{image:data.image});
   });
 });
 //spares related

 socket.on('bikeServiceStart', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   socket.to(bikeRequestByUser[requestId]).emit('bikeServiceStarted');
   socket.emit('ss');
 });

 socket.on('bikeServiceEnd', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.bikeReqStatusUpdate(db, requestId, function(results){
     console.log('results');
     socket.to(bikeRequestByUser[requestId]).emit('bikeServiceDone');
   });
   dbOperations.bikeMechStatusUpdate(db, bikeMechBySocket[socket.id], data.location,  function(results){
     console.log('results');
   });
   socket.emit('se');
 });

 socket.on('carServiceStart', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   socket.to(carRequestByUser[requestId]).emit('carServiceStarted');
   socket.emit('css');
 });

 socket.on('carInsStart', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.updateCarInsStatus(db, decoded.key, function(results){
     console.log('results');
     socket.to(carRequestByUser[requestId]).emit('carInsStarted');
     socket.emit('cis');
   });
 });

 socket.on('carInsEnd', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.saveCarJobcard(db, requestId, data.image, function(results){
     console.log('results');
     socket.to(carRequestByUser[requestId]).emit('carInsCompleted',{image:data.image});
     socket.emit('cie');
   });
 });

 socket.on('carServiceEnd', function(data) {
   var decoded = jwt.verify(data.jwt,'741852963skr');
   var ObjectID = require('mongodb').ObjectID;
   var requestId = new ObjectID(data.requestId);
   dbOperations.carReqStatusUpdate(db, requestId, function(results){
     console.log('results');
     socket.to(carRequestByUser[requestId]).emit('carServiceDone');
   });
   dbOperations.carMechStatusUpdate(db, carMechBySocket[socket.id],  function(results){
     console.log('results');
   });
   socket.emit('cse');
 });

 socket.on('getPaymentCar', function(data) {
   dbOperations.savePaymentCar(db, data, function(results){
     console.log(results);
     socket.emit('sendPaymentCar', {});
   });
 });

 socket.on('getPaymentBike', function(data) {
   dbOperations.savePaymentBike(db, data, function(results){
     console.log(results);
     socket.emit('sendPaymentBike', {});
   });
   //delete bikeRequestMap[requestId];
 });

 socket.on('getFeedbackCar', function(data) {
   dbOperations.saveCarFeedback(db, data, function(results){
     console.log(results);
     socket.emit('showFeedBackCar', results);
   });
 });

 socket.on('getFeedbackBike', function(data) {
   dbOperations.saveBikeFeedback(db, data, function(results){
     console.log(results);
     socket.emit('showFeedBackBike', results);
   });
 });

   socket.on('carCancellation', function(data) {
     dbOperations.cancelCarReq(db, data, function(results){
       console.log(results);
       socket.emit('carCancelled');
     });
   });

   socket.on('bikeCancellation', function(data) {
     dbOperations.cancelBikeReq(db, data, function(results){
       console.log(results);
       socket.emit('bikeCancelled');
     });
   });

   socket.on('getUserProfile', function(data) {
     dbOperations.getUserProfile(db, data, function(results){
       console.log(results);
       socket.emit('userProfile', results);
     });
   });

   socket.on('getBikeMechProfile', function(data) {
     dbOperations.getBikeMechProfile(db, data, function(results){
       console.log(results);
       socket.emit('bikeMechProfile', results);
     });
   });

   socket.on('getCarMechProfile', function(data) {
     dbOperations.getCarMechProfile(db, data, function(results){
       console.log(results);
       socket.emit('carMechProfile', results);
     });
   });

   socket.on('getOperProfile', function(data) {
     dbOperations.getOperProfile(db, data, function(results){
       console.log(results);
       socket.emit('operProfile', results);
     });
   });

   socket.on('checkPromo', function(data) {
     dbOperations.searchResults(db, data, function(results){
       console.log(results);//promocode validity check
       socket.emit('2', function(data) {});
     });
   });
   socket.on('getNews', function(data) {
     dbOperations.searchResults(db, data, function(results){
       console.log(results);//send news feed data w.r.t user
       socket.emit('2', function(data) {});
     });
   });


   socket.on('getFeedbackSpares', function(data) {
     dbOperations.saveSpareFeedback(db, data, function(results){
       console.log(results);
     });
   });

});



http.listen(3000, function() {
   console.log('listening on localhost:3000');
});
