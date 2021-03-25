const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://eagl:indra1234@cluster0-shard-00-00.igotq.mongodb.net:27017,cluster0-shard-00-01.igotq.mongodb.net:27017,cluster0-shard-00-02.igotq.mongodb.net:27017/test?replicaSet=atlas-wawlsh-shard-0&ssl=true&authSource=admin'; // Connection URL
const dbName = 'newDB'; // Database Name

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) { // Use connect method to connect to the server
  if(err){console.log('cant connect to db',err)}
  assert.equal(null, err);
  console.log("Connected successfully to server");
   db = client.db(dbName);
});


var redis = require('redis');
var rClient = redis.createClient();

rClient.on('connect', function() {
    console.log('Redis client connected');
});

rClient.on('error', function (err) {
    console.log('cant connect to redis ' + err);
});

rClient.hset("save", "BIKE50", 50, redis.print);
rClient.hset("save", "IPL40", 40, redis.print);
rClient.hset("redeem", "redeem5", 5, redis.print);
rClient.hset("redeem", "redeem10", 10, redis.print);
rClient.hset("redeem", "redeem15", 15, redis.print);
rClient.hset("redeem", "redeem20", 20, redis.print);
rClient.hset("redeem", "redeem25", 25, redis.print);

function scan(cursor, pattern, keysArray, callback){
  rClient.scan(cursor, 'MATCH',pattern, function(err, reply){
    if(err){
      throw err;
    }
    cursor = reply[0];
    if(cursor == '0'){
      if(keysArray.length == 0){
        var keys = reply[1];
        console.log(keys);
        for(var i = 0; i < keys.length; i++){
          keysArray.push(String(keys[i]));
        }
        return callback(keysArray);
      }
      return callback(keysArray);
    }else{
      var keys = reply[1];
      console.log(keys);
      for(var i = 0; i < keys.length; i++){
        keysArray.push(String(keys[i]));
      }
      return scan(cursor, pattern, keysArray, callback);
    }
  });
}


const Razorpay = require('razorpay');
const rPay = new Razorpay({
  key_id: 'rzp_test_42Zhc2R6XD4l6Y',
  key_secret: 'ptJaOo8SnjCuUFhAP21m3M3y',
});


let plivo = require('plivo');
let pClient = new plivo.Client('MAMWJIN2Y0MTIWYTJIYT', 'MzcwM2UyNzY0YWU2N2E2MTUwOWE3ZmZhMTViYjJl');


const OneSignal = require('onesignal-node');
const oClient = new OneSignal.Client({
    userAuthKey: 'ODRhOWRhOTktYWRhOC00OTgyLWIwNGYtMTBmOTg1NjliMDE5',
    app: { appAuthKey: 'NTM0YTI2YWQtODQxOC00ZDliLTg4NTctZmJiYjYyMDU0Y2Ex', appId: '92434f0d-482d-4378-a5b1-e598ea830f34' }
});

function pushNotification(playerId, results, header){
  var notif = new OneSignal.Notification({
    contents: {
        en: header
    },
    data: results,
    include_player_ids: [playerId]
  });

  //notif.postBody["data"] = results;

  oClient.sendNotification(notif, function (err, httpResponse,data) {
   if (err) {
       console.log('Something went wrong...');
   } else {
       console.log(data, httpResponse.statusCode);
   }
});
}

/*async function pushNotification(playerId, results){
  const notification = {
  data: results,
  include_player_ids: [playerId]
};

// using async/await
try {
  const response = await client.createNotification(notification);
  console.log(response.body.id);
} catch (e) {
  if (e instanceof OneSignal.HTTPError) {
    // When status code of HTTP response is not 2xx, HTTPError is thrown.
    console.log(e.statusCode);
    console.log(e.body);
  }
}
}*/

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}



var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var notp = require('notp');
var jwt = require('jsonwebtoken');
var dbs = require('./db');

/*app.get('/', function(req, res) {
   res.sendfile('field.html');
});*/

var userMap = {};
var usersBySocket = {};
var bikeMechMap = {};
var bikeMechBySocket = {};
var adminMap = {};
var adminsBySocket = {};
var socketToTypeMap = {};

io.on('connection', function(socket) {
   console.log('A client connected');
   socket.on('sendUserOTP', function(data) {//ToDo:new device login handler
     if(data.jwt && data.phone){// TODO: delete old redis entry
       try {
         console.log('jwt event');
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var key = data.phone;
         var token = notp.totp.gen(key,{time:120});
         console.log('user otp generated:',token);
         var hashKey = 'user:';
         hashKey += data.phone;
         rClient.exists(hashKey, function(error, exists){
           if(!error){
             if(exists == 0){
               socket.emit('userSet');
               pClient.messages.create('+919010166635', '+91'+ key,
                 'OTP: '+ token +'. Enter this OTP to change your phone number').then(function(message_created) {
                 console.log(message_created)
               });
             } else {socket.emit('userExists');}
           } else {
             console.log(error);
             throw error;
           }
         });
       } catch(err) {
         console.log(err);
       }
     } else if(data.phone){ //ToDo:verify phone no. validity(3rd party Api???)
       var key = data.phone;
       var token = notp.totp.gen(key,{time:120});
       console.log('user otp generated:',token);
       var hashKey = 'user:';
       hashKey += data.phone;
       rClient.exists(hashKey, function(error, exists){
         if(!error){
           if(exists == 0){
             socket.emit('userSet');
             pClient.messages.create('+919010166635', '+91'+ key,
               'OTP: '+ token +'. Enter this OTP to sign in').then(function(message_created) {
               console.log(message_created)
             });
           } else {
             rClient.hget(hashKey, 'status', function(error, status){
               if(!error){
                 if(status == 0){
                   socket.emit('userLogin'); // TODO:not a first time user
                   pClient.messages.create('+919010166635', '+91'+ key,
                     'OTP: '+ token +'. Enter this OTP to sign in').then(function(message_created) {
                     console.log(message_created)
                   });
                 } else {socket.emit('userExists');}// TODO:P1 necessary?
               } else {
                 console.log(error);
                 throw error;
               }
             });
           }
         } else {
           console.log(error);
           throw error;
         }
       });
     } else {console.log("invalid data on send otp")};
   });

   socket.on('verifyUserOtp', function(data){//ToDo:saving changed phone
     if(data.otp && data.phone && data.firstname && data.lastname && data.location && data.playerId){
     var login = notp.totp.verify(data.otp, data.phone, {time:120});

     if (login) {
       var hashKey = 'user:';
       hashKey += data.phone;
       console.log('Token valid, sync value is %s', login.delta);
       socket.emit('userOtpVerified');
       var jtoken = jwt.sign({fname:data.firstname, lname:data.lastname, phone:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});// TODO: different client tags

       rClient.hmset(hashKey, 'status', 1, 'playerId', data.playerId, redis.print);//ToDo:redis.print or callback?
       dbs.saveUser(db, data.firstname, data.lastname, data.location, data.phone, jtoken, data.playerId, function(results) {console.log(results.ops);});
       console.log(data.firstname, ' is added to the users collection');

       userMap[data.phone] = socket.id;
       usersBySocket[socket.id] = data.phone;
       socketToTypeMap[socket.id] = 'U';

       socket.emit('saveUserToken',{jwt:jtoken});
       console.log('user socket: ', socket.id);} else {
         return console.log('user otp invalid');
         socket.emit('userOtpInvalid');}
     } else if(data.otp && data.phone && data.playerId){
       var login = notp.totp.verify(data.otp, data.phone, {time:120});

       if (login) {
         var hashKey = 'user:';
         hashKey += data.phone;
         console.log('Token valid, sync value is %s', login.delta);
         socket.emit('userOtpVerified');
         var options = {jwt:'', fname:'', lname:'', requestId:''};
         dbs.getRequestId(db, data.phone, function(results){
           if(results[0]){options.requestId = results[0]._id;}
         });
         dbs.getUserName(db, data.phone, function(results){
           var jtoken = jwt.sign({fname:results[0].fname, lname:results[0].lname, phone:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});// TODO: different client tags
           dbs.updateUser(db, data.phone, jtoken, data.playerId, function(results) {
             console.log(data.phone, ' is updated in the users collection');
           });
           options.jwt = jtoken;
           options.fname = results[0].fname;
           options.lname = results[0].lname;
           socket.emit('userToken', options);// TODO:p1 fe authflow if(requestId)
         });

         rClient.hmset(hashKey, 'status', 1, 'playerId', data.playerId, redis.print);//ToDo:redis.print or callback?

         userMap[data.phone] = socket.id;
         usersBySocket[socket.id] = data.phone;
         socketToTypeMap[socket.id] = 'U';

         console.log('user socket: ', socket.id);} else {
           return console.log('user otp invalid');
           socket.emit('userOtpInvalid');}
     } else {console.log("invalid data on verify otp");}
   });

   socket.on('fetchUserProfile', function(data){//fname,lname,phone,email,bikes,cars,places
     if(data){
       console.log("fetchUserProfile");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.getUserProfile(db, decoded.phone,  function(results){
           socket.emit('userProfile',{results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data getUserProfile");}
   });

   socket.on('editUserPhone', function(data){
     if(data.jwt && data.otp && data.phone){// TODO: data.playerId
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         //console.log('jtoken verified');

         var login = notp.totp.verify(data.otp, data.phone, {time:120});

         if (login) {
           var hashKey = 'user:';
           hashKey += decoded.phone;
           var newHashKey = hashKey + data.phone;
           rClient.del(hashKey, function(err, response) {
             if (response == 1) {
               rClient.hmset(newHashKey, 'status', 1, 'playerId', data.playerId, redis.print);
             } else{
               console.log("Cannot delete")
             }
           });
           console.log('Token valid, sync value is %s', login.delta);
           socket.emit('userOtpVerified');//ToDo:necessary??
           var jtoken = jwt.sign({fname:data.firstname, lname:data.lastname, phone:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});// TODO: different client tags
           console.log('jsonwebtoken created:',jtoken);

           dbs.updateUserPhone(db, decoded.phone, data.phone, jtoken, function(results) {
             console.log(data.phone, ' is updated in the users collection');
             socket.emit('saveUserToken',{jwt:jtoken});
           });

           delete userMap[decoded.phone];

           userMap[data.phone] = socket.id;
           usersBySocket[socket.id] = data.phone;
         } else {
           return console.log('Token invalid');
           socket.emit('userOtpInvalid');}
         } catch(err) {
           console.log(err);
         }
       } else {console.log("invalid data editUserPhone");}
   });

   socket.on('editUserfName', function(data){
     if(data.jwt && data.fname){
       console.log("editUserfName");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.updateUserfName(db, decoded.phone, data.fname,  function(results){
           //console.log(results);
           socket.emit('fnameEdited');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data editUserfName");}
   });

   socket.on('editUserlName', function(data){
     if(data.jwt && data.lname){
       console.log("editUserlName");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.updateUserlName(db, decoded.phone, data.lname,  function(results){
           console.log(results);
           socket.emit('lnameEdited');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data editUserlName");}
   });

   socket.on('editUserMail', function(data){
     if(data.jwt && data.email){
       console.log("editUserMail");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.updateUserMail(db, decoded.phone, data.email,  function(results){
           //console.log(results.ops);
           socket.emit('userMailEdited');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data editUserMail");}
   });

   socket.on('editUserPlaces', function(data){
     if(data.address && data.jwt){
       console.log("editUserPlaces");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.updateUserPlaces(db, decoded.phone, data.address, function(results){//errorCheck
           //console.log(results.ops);
           socket.emit('userPlacesEdited');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data editUserPlaces");}
   });

   socket.on('editUserBike', function(data){
     if(data.bikeDetails && data.jwt){
       console.log("editUserBike");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.updateUserBikes(db, decoded.phone, data.bikeDetails,  function(results){//errorCheck
           //console.log(results.ops);
           socket.emit('userVehiclesEdited');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data editUserVehicles");}
   });

   socket.on('editUserCar', function(data){
     if(data.carDetails && data.jwt){
       console.log('editUserCar');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.updateUserCars(db, decoded.phone, data.carDetails,  function(results){//errorCheck
           //console.log(results.ops);
           socket.emit('userVehiclesEdited');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data editUserVehicles");}
   });

   socket.on('fetchUserScheduledRequests', function(data){
     if(data.jwt){
       console.log("fetchUserScheduledRequests");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         //console.log('jtoken verified');

         dbs.getUserScheduledRequests(db, decoded.phone,  function(results){
           socket.emit('userScheduledRequests',{results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data fetchUserScheduledRequests");}
   });

   socket.on('fetchUserServiceHistoryList', function(data){
     if(data.jwt){
       console.log("fetchUserServiceHistoryList");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         //console.log('jtoken verified');

         dbs.getUserServiceHistoryList(db, decoded.phone,  function(results){
           socket.emit('userServiceHistoryList',{results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data fetchUserServiceHistoryList");}
   });

   socket.on('fetchUserServiceHistory', function(data){
     if(data.jwt && data.requestId){
       console.log("fetchUserServiceHistory");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         dbs.getUserServiceHistory(db, requestId,  function(results){
           socket.emit('userServiceHistory',{results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data fetchUserServiceHistory");}
   });

   socket.on('reportBikeRequest', function(data){
     if(data.jwt && data.requestId && data.problems){
       console.log("reportBikeRequest");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         dbs.reportBikeRequest(db, requestId, data.problems, data.description, function(results){});

         rClient.hset('bikeRequestByUser', data.requestId, decoded.phone, redis.print);

         var myResults = new Array()
         scan(0, 'admin:*', myResults, function (results) {console.log('admin keys : ', results);
           var keys = results;
           for(var i = 0; i < keys.length; i++){
             rClient.hget(keys[i], 'playerId',  function (error, playerId) {
               if (error) {
                 console.log(error);
               } else {
                 var header = 'Bike request reported';
                 pushNotification(playerId, {status : 'Report'}, header);
               }
             });
           }
         });

         socket.emit('reported');
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data reportBikeRequest");}
   });

   socket.on('help', function(data){
     if(data.jwt && data.problems){
       console.log("help");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.saveHelp(db, decoded.phone, decoded.fname, decoded.lname, data.problems, function(results){});

         var myResults = new Array()
         scan(0, 'admin:*', myResults, function (results) {console.log('admin keys : ', results);
           var keys = results;
           for(var i = 0; i < keys.length; i++){
             rClient.hget(keys[i], 'playerId',  function (error, playerId) {
               if (error) {
                 console.log(error);
               } else {
                 var header = 'User requested for help';
                 pushNotification(playerId, {status : 'help'}, header);
               }
             });
           }
         });

         socket.emit('h');
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data help");}
   });

   socket.on('bikeRequestRectified', function(data){// TODO:p1 del requestId map to user
     if(data.jwt && data.requestId && data.correction){
       console.log("bikeRequestRectified");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         dbs.rectifyBikeRequest(db, requestId, data.correction, function(results){});

         rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
           if(!error){
             rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
               if (error) {
                 console.log(error);
               } else {
                 var header = 'Bike service report has been addressed';
                 pushNotification(playerId, {status:'Rectified'}, header);
               }
             });
             rClient.hdel('bikeRequestByUser', data.requestId, redis.print);
           } else {
             console.log(error);
             throw error;
           }
         });

         socket.emit('rectified');
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data bikeRequestRectified");}
   });


   socket.on('sendBikeMechOTP', function(data) {
     if(data){
       var key = data.phone;
       var token = notp.totp.gen(key,{time:120});
       console.log('bikeMech otp generated:',token);
       var hashKey = 'bikeMech:';
       hashKey += data.phone;
       rClient.exists(hashKey, function(error, exists){
         if(!error){
           if(exists == 0){
             socket.emit('bikeMechSet');
             pClient.messages.create('+919010166635', '+91'+ key,
               'OTP: '+ token +'. Enter this OTP to sign in').then(function(message_created) {
               console.log(message_created)
             });
           } else {
             rClient.hget(hashKey, 'status', function(error, status){
               if(!error){
                 if(status == 0){
                   socket.emit('bikeMechSet');
                   pClient.messages.create('+919010166635', '+91'+ key,
                     'OTP: '+ token +'. Enter this OTP to sign in').then(function(message_created) {
                     console.log(message_created)
                   });
                 } else {socket.emit('bikeMechExists');}
               } else {
                 console.log(error);
                 throw error;
               }
             });
           }
         } else {
           console.log(error);
           throw error;
         }
       });
     } else {console.log("invalid data on send otp")}
   });

   socket.on('verifyBikeMechOtp', function(data){
     if(data.otp && data.phone && data.firstname && data.lastname && data.location){
       var login = notp.totp.verify(data.otp, data.phone, {time:120});

       if (login) {
         var hashKey = 'bikeMech:';
         hashKey += data.phone;

         console.log('Token valid, sync value is %s', login.delta);
         socket.emit('bikeMechOtpVerified');
         var jtoken = jwt.sign({fname:data.firstname, lname:data.lastname, phone:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});// TODO: different client tags
         console.log('bikeMech token created:',jtoken);

         rClient.exists(hashKey, function(error, exists){
           if(!error){
             if(exists == 0){
               rClient.hset(hashKey, 'status', 1, redis.print);
               dbs.saveBikeMech(db, data.firstname, data.lastname, data.location, data.phone, jtoken, function(results) {console.log(results.ops);});
               console.log(data.firstname, ' is added to the bikemech collection');
             } else {
               rClient.hset(hashKey, 'status', 1, redis.print);
             }
           } else {
             console.log(error);
             throw error;
           }
         });

         bikeMechMap[data.phone] = socket.id;
         bikeMechBySocket[socket.id] = data.phone;
         socketToTypeMap[socket.id] = 'BM';

         socket.emit('saveBikeMechToken',{jwt:jtoken});
         console.log('bikeMech socket: ', socket.id);
        } else {
           return console.log('bikeMech otp invalid');
           socket.emit('bikeMechOtpInvalid');}
     } else {console.log("invalid data on verify otp");}
   });

   socket.on('getBikeMechServicesList', function(data){
     if(data.jwt){
       console.log('getBikeMechServicesList');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.bikeMechServices(db, decoded.phone, function(results){
           socket.emit('bikeMechServicesList', {results:results});//fname,lname,phone,expertise,servicesDone(complete)
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getBikeMechServicesList");}
   });

   socket.on('sendAdminOTP', function(data) {
     if(data.jwt && data.phone){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var key = data.phone;
         var token = notp.totp.gen(key,{time:120});
         console.log('admin otp generated:',token);
         var hashKey = 'admin:';
         hashKey += data.phone;
         rClient.exists(hashKey, function(error, exists){
           if(!error){
             if(exists == 0){
               socket.emit('adminSet');
               pClient.messages.create('+919010166635', '+91'+ key,
                 'OTP: '+ token +'. Enter this OTP to change your phone number').then(function(message_created) {
                 console.log(message_created)
               });
             } else {socket.emit('adminExists');}
           } else {
             console.log(error);
             throw error;
           }
         });
       } catch(err) {
         console.log(err);
       }
     } else if(data.phone){ //ToDo:verify phone no. validity(3rd party Api???)
         var key = data.phone;
         var token = notp.totp.gen(key,{time:120});
         console.log('admin otp generated:',token);
         var hashKey = 'admin:';
         hashKey += data.phone;
         rClient.exists(hashKey, function(error, exists){
           if(!error){
             if(exists == 0){
               socket.emit('adminSet');
               pClient.messages.create('+919010166635', '+91'+ key,
                 'OTP: '+ token +'. Enter this OTP to sign in').then(function(message_created) {
                 console.log(message_created)
               });
             } else {
               rClient.hget(hashKey, 'status', function(error, status){
                 if(!error){
                   if(status == 0){
                     socket.emit('adminSet');
                     pClient.messages.create('+919010166635', '+91'+ key,
                       'OTP: '+ token +'. Enter this OTP to sign in').then(function(message_created) {
                       console.log(message_created)
                     });
                   } else {socket.emit('adminExists');}
                 } else {
                   console.log(error);
                   throw error;
                 }
               });
             }
           } else {
             console.log(error);
             throw error;
           }
         });
       } else {console.log("invalid data on send otp")};
   });

   socket.on('verifyAdminOtp', function(data){
     if(data.otp && data.phone && data.firstname && data.lastname && data.playerId){
       var login = notp.totp.verify(data.otp, data.phone, {time:120});

       if (login) {
         var hashKey = 'admin:';
         hashKey += data.phone;

         console.log('Token valid, sync value is %s', login.delta);
         socket.emit('adminOtpVerified');
         var jtoken = jwt.sign({id:data.firstname, key:data.phone},'741852963skr',{expiresIn:"7 days", issuer:"eagl"});// TODO: different client tags
         console.log('admin token created:',jtoken);

         rClient.exists(hashKey, function(error, exists){
           if(!error){
             if(exists == 0){
               rClient.hmset(hashKey, 'status', 1, 'playerId', data.playerId, redis.print);
               dbs.saveAdmin(db, data.firstname, data.lastname, data.phone, jtoken, data.playerId, function(results) {console.log(results.ops);});
               console.log(data.firstname, ' is added to the admins collection');
             } else {
               rClient.hset(hashKey, 'status', 1, redis.print);
             }
           } else {
             console.log(error);
             throw error;
           }
         });

         adminMap[data.phone] = socket.id;
         adminsBySocket[socket.id] = data.phone;
         socketToTypeMap[socket.id] = 'A';

         socket.emit('saveAdminToken',{jwt:jtoken});
         console.log('admin socket: ', socket.id);} else {
           return console.log('admin otp invalid');
           socket.emit('adminOtpInvalid');}
       } else {console.log("invalid data on verify otp");}
   });

   socket.on('userAuth', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('userAuth',decoded);

         if(data.requestId){console.log('request block : ', data.requestId);
           //ToDo:optimization for google api calls(event to mechanic)
           var ObjectID = require('mongodb').ObjectID;
           var requestId = new ObjectID(data.requestId);
           console.log("user socket: ", socket.id);
           userMap[decoded.phone] = socket.id;
           usersBySocket[socket.id] = decoded.phone;
           socketToTypeMap[socket.id] = 'U';
           dbs.getBikeRequestStatus(db, requestId, function(results){
             if(results[0]){
               if(results[0].status){
                 var tag = results[0].status;
                 switch (tag) {
                   case 'engaged':
                   var options = {requestId:results[0]._id,fname:results[0].mfname,lname:results[0].mlname,phone:results[0].mechId,bike:results[0].mBike,url:results[0].mPic}
                   socket.emit('intimate', options);// TODO: mechRating
                   break;

                   case 'cancelled':
                   socket.emit('bikeCancelled');
                   break;
                 }
               }

               if(results[0].payMode){
                 var tag = results[0].payMode;
                 switch (tag) {
                   case 'paidCash':
                   dbs.getUserRedeem(db, decoded.phone, function(results){
                     socket.emit('redeemed', {amount : results[0].redeem});
                   });
                   socket.emit('paymentSuccess');
                   break;

                   case 'online':
                   dbs.getUserRedeem(db, decoded.phone, function(results){
                     socket.emit('redeemed', {amount : results[0].redeem});
                   });
                   break;
                 }
               }

               if(results[0].insStatus){
                 var tag = results[0].insStatus;
                 switch (tag) {
                   case 'is':
                   socket.emit('bikeInsStarted');
                   break;

                   case 'ie':
                   socket.emit('bikeInsStarted');
                   socket.emit('bikeInsCompleted', {jobCard:results[0].jobCard});
                   break;

                   case 'sr':
                   socket.emit('bikeInsStarted');
                   socket.emit('bikeInsCompleted', {jobCard:results[0].jobCard});
                   socket.emit('bikeServicePermission', {
                     serviceList:results[0].serviceList,
                     labourCharge:results[0].labourCharge,
                     spareCharge:results[0].spareCharge
                   });
                   break;

                   case 'sa':
                   socket.emit('bikeInsStarted');
                   socket.emit('bikeInsCompleted', {jobCard:results[0].jobCard});
                   break;

                   case 'ss':
                   socket.emit('bikeInsStarted');
                   socket.emit('bikeInsCompleted', {jobCard:results[0].jobCard});
                   socket.emit('bikeServiceStarted');
                   break;

                   case 'se':
                   socket.emit('bikeInsStarted');
                   socket.emit('bikeInsCompleted', {jobCard:results[0].jobCard});
                   socket.emit('bikeServiceStarted');
                   socket.emit('bikeServiceDone', {
                     servicedList:results[0].servicedList,
                     finalLabourCharge:results[0].finalLabourCharge,
                     finalSpareCharge:results[0].finalSpareCharge,
                     tax:results[0].gst,
                     total:results[0].total
                   });
                   break;
                 }
               }
             }
           });
         }else{
           userMap[decoded.phone] = socket.id;
           console.log("user socket: ", socket.id);
           usersBySocket[socket.id] = decoded.phone;
           socketToTypeMap[socket.id] = 'U';
         }
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on userAuth");}
   });

   socket.on('bikeMechAuth', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('bikeMechAuth',decoded);
         if(data.requestId){console.log('request block : ', data.requestId);
           //ToDo:optimization for google api calls(event to mechanic)
           var ObjectID = require('mongodb').ObjectID;
           var requestId = new ObjectID(data.requestId);
           console.log("bikeMech socket: ", socket.id);
           bikeMechMap[decoded.phone] = socket.id;
           bikeMechBySocket[socket.id] = decoded.phone;
           socketToTypeMap[socket.id] = 'BM';
           dbs.getBikeRequestStatus(db, requestId, function(results){
             if(results[0]){
               if(results[0].status){
                 if(results[0].status == 'cancelled'){socket.emit('bikeCancelled');}
               }

               if(results[0].payMode){
                 var tag = results[0].payMode;
                 switch (tag) {
                   case 'cash':
                   socket.emit('receivePayment', {total:results[0].total});
                   break;

                   case 'online':
                   socket.emit('paymentComplete');
                   break;
                 }
               }

               if(results[0].insStatus){
                 var tag = results[0].insStatus;
                 switch (tag) {
                   case 'sa':
                   socket.emit('bikeServiceApproved');
                   break;

                   case 'se':
                   socket.emit('bikeServiceDone', {total:results[0].total});
                   break;
                 }
               }
             }
           });
         }else{
           console.log("bikeMech socket: ", socket.id);
           bikeMechMap[decoded.phone] = socket.id;
           bikeMechBySocket[socket.id] = decoded.phone;
           socketToTypeMap[socket.id] = 'BM';
         }
       } catch(err) {
         console.log(err);
         socket.emit('invalidBikeMechAuth');
       }
     } else {console.log("invalid data on bikeMechAuth");}
   });

   socket.on('adminAuth', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('adminAuth',decoded);
         adminMap[decoded.key] = socket.id;
         adminsBySocket[socket.id] = decoded.key;
         socketToTypeMap[socket.id] = 'A';
       } catch(err) {
         console.log(err);
         socket.emit('invalidAdminAuth');
       }
     } else {console.log("invalid data on adminAuth");}
   });

   socket.on('bikeMechOnline', function(data) {
     if(data.jwt && data.location){console.log("bikeMech socket: ", socket.id);
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         dbs.bikeMechOnline(db, decoded.phone, data.location, function(results){
           console.log('bike mech online');
           socket.emit('bikeMechOnline');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data bikeMechOnline");}
   });

   socket.on('bikeMechOffline', function(data) {
     if(data.jwt){console.log("bikeMech socket: ", socket.id);
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         dbs.bikeMechOffline(db, decoded.phone, function(results){
           console.log('bike mech offline');
           socket.emit('bikeMechOffline');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data bikeMechOffline");}
   });

   socket.on('disconnect', function() {
     var tag = socketToTypeMap[socket.id];
     switch (tag) {
       case 'U': //ToDo:optimization for google api calls(event to mechanic)
       var ph = usersBySocket[socket.id];
       console.log('user disconnect: ', ph);
       delete userMap[ph];
       delete usersBySocket[socket.id];
       delete socketToTypeMap[socket.id];
       break;

       case 'BM':
       var ph = bikeMechBySocket[socket.id];
       dbs.bikeMechOffline(db, ph, function(results){
         console.log('bikeMech disconnect: ', ph);
       });
       delete bikeMechMap[ph];
       delete bikeMechBySocket[socket.id];
       delete socketToTypeMap[socket.id];
       break;

       case 'A':
       var ph = adminsBySocket[socket.id];
       console.log('admin disconnect: ', ph);
       delete adminMap[ph];
       delete adminsBySocket[socket.id];
       delete socketToTypeMap[socket.id];
       break;
     }
   });

   socket.on('userLogout', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var hashKey = 'user:';
         hashKey += decoded.phone;
         rClient.hset(hashKey, 'status', 0, redis.print);
         delete userMap[decoded.phone];
         delete usersBySocket[socket.id];
         delete socketToTypeMap[socket.id];
         //ToDo:optimization for google api calls(event to mechanic)
         console.log('user is logged out');
         socket.emit('loggedOut');
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on userLogout");}
   });

   socket.on('bikeMechLogout', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var hashKey = 'bikeMech:';
         hashKey += decoded.phone;
         rClient.hset(hashKey, 'status', 0, redis.print);
         dbs.bikeMechOffline(db, decoded.phone, function(results){});
         delete bikeMechMap[decoded.phone];
         delete bikeMechBySocket[socket.id];
         delete socketToTypeMap[socket.id];
         //ToDo:optimization for google api calls(event to mechanic)
         console.log('bikeMech is logged out');
         socket.emit('loggedOut');
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on bikeMechLogout");}
   });


   socket.on('nearestBikeMech', function(data){
     if(data.location && data.jwt){
       var loc = data.location.map(Number);
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.fetchBikeMech(db, loc, function(results){
           console.log('nearestBikeMech collection: ',results);
           socket.emit('bikeMechMapView', results);
         });
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data nearest bike mech");}
    });


   socket.on('schedBikeReq', function(data) {//ToDo:p1 push notification integration
     if(data.location && data.jwt && data.bikeDetails && data.typeOfService && data.date && data.time){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var loc = data.location.map(Number);
         var dd = Number(data.date.substring(0,2));
         var mm = Number(data.date.substring(3,5));
         var yy = Number(data.date.substring(6,8));
         var hr = Number(data.time.substring(0,2));
         var min = Number(data.time.substring(3,5));

         var requestDate = new Date();
         var scheduleDate = new Date(yy, mm, dd, hr, min);
         var timeOut = Math.abs((scheduleDate.getTime() - requestDate.getTime()) / 1000);

         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID;
         rClient.hset('bikeRequestByUser', requestId.toString(), decoded.phone, redis.print);//ToDo:redis.print or callback?

         dbs.updateUserBikes(db, decoded.phone, data.bikeDetails, function(results){});

         dbs.saveShedBikeReq(db, requestId, decoded.fname, decoded.lname, decoded.phone, loc, scheduleDate, requestDate, data.bikeDetails, data.typeOfService, function(results){
           console.log('sheduled bikeRequest saved');
         });
         socket.emit('bikeReqSchedld');
         setTimeout(function() {
           //ToDo:if(!reSched){assign the request to operator/admin when automated}
         }, timeOut);
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data schedBikeReq");}
   });


   socket.on('bookBike', function(data){
     if(data.location && data.jwt && data.bikeDetails && data.typeOfService){// TODO: save loc as user address
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var loc = data.location.map(Number);
         var requestDate = new Date();

         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID;
         var rId = requestId.toString();

         var userProfile;
         userProfile = [decoded.phone,decoded.fname, decoded.lname];
         dbs.updateUserBikes(db, decoded.phone, data.bikeDetails, function(results){});
         rClient.hset('bikeRequestByUser', rId, decoded.phone, redis.print);

         dbs.saveBikeRequest(db, requestId, decoded.fname, decoded.lname, decoded.phone, loc, requestDate, data.bikeDetails, data.typeOfService, function(results){
           console.log('bikeRequest saved: ', rId);
         });

         var radius = distance(data.location[1], data.location[0], 17.481432, 78.374227);
         if(radius > 10){console.log('outOfBound');socket.emit('outOfBound');} else {
           var myResults = new Array();
           scan(0, 'admin:*', myResults, function (results) {console.log('admin keys : ', results);
             var keys = results;
             for(var i = 0; i < keys.length; i++){
               rClient.hget(keys[i], 'playerId',  function (error, playerId) {
                 if (error) {
                   console.log(error);
                 } else {
                   console.log('admin playerId ', playerId);
                   var header = 'Bike service requested';
                   pushNotification(playerId, {status : 'bikeRequest'}, header);//Drawer
                 }
               });
             }
           });
          socket.emit('bikeRequestPlaced', {requestId:requestId});
          //dbs.bikeRequestPending(db, requestId, function(results){});
         }
       } catch(err) {
          console.log(err);
       }
     } else {console.log("invalid data bookBike");}
   });


   socket.on('rejectBike', function(data){
     if(data.requestId && data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         //ToDo:p1 relevant db function
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data rejectBike");}
   });

   socket.on('bookCar', function(data){
     if(data.location && data.jwt){
       var loc = data.location.map(Number);

       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.saveCarRequest(db, decoded.fname, decoded.lname, decoded.phone, loc, function(results){
           console.log('carRequest saved');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data bookCar");}
   });

   socket.on('bikeRqstAccptd',function(data){//pushNotification
     if(data.requestId && data.jwt && data.location){
       console.log('bikeRqstAccptd');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);
         var startTime = new Date().getTime();

         var options = {requestId:requestId,fname:decoded.fname,lname:decoded.lname,phone:decoded.phone,bike:'',url:''}

         rClient.sismember('bikeRequestMap', data.requestId, function(err, result) {
          if (!err){console.log('bikeRequestMap: ', result);
            if(result==0){
              rClient.sadd('bikeRequestMap', data.requestId, redis.print);//ToDo:redis.print or callback?
              console.log('request accepted of id: ', requestId);
              rClient.hset('bikeRequestByMech', data.requestId, decoded.phone, redis.print);//ToDo:redis.print or callback?

              dbs.getBikeMech(db, decoded.phone, function(results){
                options.bike = results[0].vehicleNo;
                options.url = results[0].url;
                rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
                  if(!error){
                    socket.to(userMap[String(phone)]).emit('intimate',options);
                    console.log('intimate to: ', userMap[String(phone)]);
                    dbs.bikeMechBusy(db, decoded.phone,  function(results){
                      console.log('mechanic status updated');
                    });

                    rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
                      if (error) {
                        console.log(error);
                      } else {
                        var header = 'Bike service request accepted. You can track service status';
                        pushNotification(playerId, {status : 'Drawer'}, header);//Drawer
                      }
                    });
                  } else {
                    console.log(error);
                    throw error;
                  }
                });
                dbs.bikeRequestUpdate(db, requestId, decoded.phone, decoded.fname, decoded.lname, results[0].vehicleNo, results[0].url, startTime, function(results){
                  console.log('bikeRequest accepted and engaged');
                });
              });

              socket.emit('bikeRqstConfirm');
              console.log('bikeRqstConfirm');
            } else {console.log("request already accepted");
               socket.emit('brAlreadyAccptd');
             }
          } else {
              throw err;
              console.log(err);
            }
          });
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeRqstAccptd");}
    });

    socket.on('updateBikeMechLoc', function(data) {//ToDo:no calls when inactive
      if(data.jwt && data.location){
        if(data.requestId){
          console.log("updateBikeMechLoc to user");
          try {
            var decoded = jwt.verify(data.jwt,'741852963skr');
            var ObjectID = require('mongodb').ObjectID;
            var requestId = new ObjectID(data.requestId);
            dbs.updateBikeMechLoc(db, decoded.phone, data.location, function(results){/*ToDo:when mech if offline what happens??*/});

            rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
              if(!error){
                rClient.sismember('bikeRequestMap', data.requestId, function(err, result) {
                 if (!err){
                   console.log('sendBikeMechLoc: ', result);
                   if(result){socket.to(userMap[String(phone)]).emit('sendBikeMechLoc', {location:data.location});}
                 } else {
                     throw err;
                     console.log(err);
                   }
                 });
              } else {
                console.log(error);
                throw error;
              }
            });
          } catch(err) {
            console.log(err);
          }
        } else {
          console.log("updateBikeMechLoc");
          try {
            var decoded = jwt.verify(data.jwt,'741852963skr');
            var ObjectID = require('mongodb').ObjectID;
            var requestId = new ObjectID(data.requestId);
            dbs.updateBikeMechLoc(db, decoded.phone, data.location, function(results){});
          } catch(err) {
            console.log(err);
          }
        }
      }else{console.log("invalid data updateBikeMechLoc");}
    });

    socket.on('bikeInsStart', function(data) {//push notification
      if(data.jwt && data.requestId){
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          //var options = {insStatus:'is'}
          rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
            if(!error){
              dbs.updateBikeInsStatus(db, requestId, 'is', function(results){
                socket.to(userMap[String(phone)]).emit('bikeInsStarted');
              });

              rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Bike inspection has been started';
                  pushNotification(playerId, {status:'Inspection'}, header);//Inspection
                }
              });
            } else {
              console.log(error);
              throw error;
            }
          });

          console.log('bikeInsStart');
          socket.emit('is');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeInsStart");}
    });

    socket.on('delegateBike', function(data) {
      if(data.jwt && data.requestId){
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);
          console.log('delegateBike');
          dbs.delegateBike(db, requestId, function(results){});

          myResults = new Array();
          scan(0, 'admin:*', myResults, function (results) {console.log('admin keys : ', results);
            var keys = results;
            for(var i = 0; i < keys.length; i++){
              rClient.hget(keys[i], 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Bike request delegated';
                  pushNotification(playerId, {status : 'Delegate'}, header);//Drawer
                }
              });
            }
          });
          socket.emit('delegatedBike');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data delegateBike");}
    });

    socket.on('bikeInsEnd', function(data) {//push notification
      if(data.jwt && data.requestId && data.jobCard){
        console.log(data.jobCard,'jobcard');
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          //var options = {insStatus:'ie', jobCard:data.jobCard}

          dbs.saveBikeJobcard(db, requestId, data.jobCard, function(results){});

          rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
            if(!error){
              socket.to(userMap[String(phone)]).emit('bikeInsCompleted',{jobCard: data.jobCard});
              rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Bike inspection has been completed';
                  pushNotification(playerId, {status:'Inspection'}, header);//Inspection
                }
              });
            } else {
              console.log(error);
              throw error;
            }
          });

          console.log('bikeInsEnd');
          socket.emit('ie');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeInsEnd");}
    });

    socket.on('bikeServiceList', function(data){
      if(data.jwt && data.requestId && data.serviceList && data.labourCharge && data.spareCharge){
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);
          var d = {
            serviceList:data.serviceList,
            labourCharge:data.labourCharge,
            spareCharge:data.spareCharge
          };
          /*var options = {
            insStatus:'ie',
            serviceList:data.serviceList,
            labourCharge:data.labourCharge,
            spareCharge:data.spareCharge
          }*/

          dbs.saveBikeServiceList(db, requestId, data.serviceList, data.labourCharge, data.spareCharge, function(results){});

          rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
            if(!error){
              socket.to(userMap[String(phone)]).emit('bikeServicePermission', d);
              rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Please grant permission to start service';
                  pushNotification(playerId, {status:'Inspection'}, header);
                }
              });
            } else {
              console.log(error);
              throw error;
            }
          });

          rClient.hget('bikeRequestByMech', data.requestId, function(error, phone){
            if(!error){
              socket.to(bikeMechMap[String(phone)]).emit('bikeServiceList', d);
            } else {
              console.log(error);
              throw error;
            }
          });

          console.log('bikeServiceList saved');
          socket.emit('sl');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeServiceList");}
    });

    socket.on('bikeServiceApprove', function(data) {//push notification
      if(data.jwt && data.requestId && data.labourCharge && data.spareCharge){
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          rClient.hget('bikeRequestByMech', data.requestId, function(error, phone){
            if(!error){
              dbs.updateBikeInsStatus(db, requestId, 'sa', function(results){
                socket.to(bikeMechMap[String(phone)]).emit('bikeServiceApproved');
              });
            } else {
              console.log(error);
              throw error;
            }
          });

          console.log('bikeServiceApproved');
          //dbs.saveBikeServiceList(db, requestId, data.serviceList, data.labourCharge, data.spareCharge, function(results){});
          var myResults = new Array()
          scan(0, 'admin:*', myResults, function (results) {console.log('admin keys : ', results);
            var keys = results;
            for(var i = 0; i < keys.length; i++){
              rClient.hget(keys[i], 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Bike service has been approved';
                  pushNotification(playerId, {status : 'bikeServiceApproved'}, header);//Drawer
                }
              });
            }
          });
          socket.emit('sa');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeServiceApprove");}
    });

    socket.on('bikeServiceStart', function(data) {//push notification
      if(data.jwt && data.requestId){
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          //var options = {insStatus:'ss'}
          rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
            if(!error){
              dbs.updateBikeInsStatus(db, requestId, 'ss', function(results){
                socket.to(userMap[String(phone)]).emit('bikeServiceStarted');
              });

              rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Bike service has been started';
                  pushNotification(playerId, {status:'Inspection'}, header);
                }
              });
            } else {
              console.log(error);
              throw error;
            }
          });

          console.log('bikeServiceStart');
          socket.emit('ss');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeServiceStart");}
    });

    socket.on('bikeServiceEnd', function(data) {//push notification
      if(data.jwt && data.requestId && data.servicedList && data.finalLabourCharge && data.finalSpareCharge){
        try {
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);
          var lc = Number(data.finalLabourCharge);
          var sc = Number(data.finalSpareCharge);
          var tax = lc * 0.18
          var tot = lc + sc + tax;
          var d = {
            servicedList:data.servicedList,
            finalLabourCharge:data.finalLabourCharge,
            finalSpareCharge:data.finalSpareCharge,
            gst:tax,
            total:tot
          }
          /*var options = {
            insStatus:'se',
            servicedList:data.servicedList,
            finalLabourCharge:data.finalLabourCharge,
            finalSpareCharge:data.finalSpareCharge,
            gst:tax,
            total:tot
          }*/

          rClient.hget('bikeRequestByMech', data.requestId, function(error, phone){
            if(!error){
              socket.to(bikeMechMap[String(phone)]).emit('bikeServiceDone', {total:tot});
            } else {
              console.log(error);
              throw error;
            }
          });

          console.log('bikeServiceEnd');
          dbs.bikeReqStatusUpdate(db, requestId, data.servicedList, data.finalLabourCharge, data.finalSpareCharge, tax, tot,  function(results){});

          rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
            if(!error){
              socket.to(userMap[String(phone)]).emit('bikeServiceDone', d);
              rClient.hget('user:'+phone, 'playerId',  function (error, playerId) {
                if (error) {
                  console.log(error);
                } else {
                  var header = 'Bike service has been completed';
                  pushNotification(playerId, {status:'Inspection'}, header);//Inspection
                }
              });
            } else {
              console.log(error);
              throw error;
            }
          });
          socket.emit('se');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeServiceEnd");}
    });

    socket.on('getCredits', function(data) {
      if(data.jwt){
        try {
          console.log('credits: ',data.credits);
          var decoded = jwt.verify(data.jwt,'741852963skr');
          dbs.updateUserCredits(db, decoded.phone, data.credits, function(results){});
          console.log('getCredits');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data getCredits");}
    });

    socket.on('checkReward', function(data) {
      if(data.jwt && data.code && data.requestId && data.finalLabourCharge && data.finalSpareCharge){
        try {
          console.log('checkReward');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          var lc = Number(data.finalLabourCharge);
          var sc = Number(data.finalSpareCharge);

          dbs.getUserCredits(db, decoded.phone, function(results){
            rClient.hget("redeem", data.code,  function (error, result) {
              if (result <= results[0].credits) {
                var flc = (1 - (result/100)) * lc;
                var tax = flc * 0.18;
                var tot = flc+sc+tax;
                var disc = lc - flc;
                var d = {
                  finalLabourCharge:flc,
                  finalSpareCharge:data.finalSpareCharge,
                  gst:tax,
                  total:tot,
                  discount:disc
                }
                var credits = results[0].credits - result;
                dbs.updatePaymentBike(db, requestId, data.code, tax, tot, function(results){});
                dbs.updateUserRedeem(db, decoded.phone, credits, result, function(results){
                  socket.emit('promo', d);
                });
                console.log('redeem: ', data.code);
              } else {
                socket.emit('noPromo');
              }
            });
          });
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data checkReward");}
    });

    socket.on('checkPromo', function(data) {
      if(data.jwt && data.code && data.requestId && data.finalLabourCharge && data.finalSpareCharge){
        try {
          console.log('checkPromo');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          var lc = Number(data.finalLabourCharge);
          var sc = Number(data.finalSpareCharge);

          rClient.hget('save', data.code,  function (error, result) {
            if (result) {
              var flc = (1 - (result/100)) * lc;
              var tax = flc * 0.18;
              var tot = flc+sc+tax;
              var disc = lc - flc;
              var d = {
                finalLabourCharge:flc,
                finalSpareCharge:data.finalSpareCharge,
                gst:tax,
                total:tot,
                discount:disc
              }
              dbs.updatePaymentBike(db, requestId, data.code, tax, tot, function(results){});
              socket.emit('promo', d);
              console.log('promo: ', data.code);
            } else {
              socket.emit('noPromo');
            }
          });
        } catch(err) {
           console.log(err);
        }
      } else {console.log("invalid data checkPromo");}
    });

    socket.on('payOnline', function(data) {
      if(data.jwt && data.requestId && data.total){
        try {
          console.log('payOnline');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);
          console.log('payOnline');
          var total = data.total * 100;

          var options = {
            amount: total,  // amount in the smallest currency unit
            currency: "INR",
            receipt:'receiptId: 1',// TODO:p1
            payment_capture: '0'
          };
          rPay.orders.create(options, function(err, order) {
            console.log('razorpay orderId : ', order.id);
            dbs.saveBikePayment(db, requestId, order.id, function(results){});
            socket.emit('checkOut', {orderId : order.id});
          });
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data payOnline");}
    });

    socket.on('paymentSuccess', function(data){
      if(data.jwt && data.requestId && data.paymentId && data.signature){
        try {
          console.log('paymentSuccess');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          rClient.hget('bikeRequestByMech', data.requestId, function(error, phone){
            if(!error){
              socket.to(bikeMechMap[String(phone)]).emit('paymentComplete');
              dbs.bikeMechanicOnline(db, String(phone), function(results){});
            } else {
              console.log(error);
              throw error;
            }
          });

          dbs.updatePaymentMode(db, requestId, 'online', function(results){});
          dbs.updateBikePayment(db, requestId, data.paymentId, data.signature, function(results){});
          dbs.getUserRedeem(db, decoded.phone, function(results){
            socket.emit('redeemed', {amount : results[0].redeem});
          });

          rClient.srem('bikeRequestMap', data.requestId, redis.print);//ToDo:redis.print or callback?
          rClient.hdel('bikeRequestByMech', data.requestId, redis.print);
          rClient.hdel('bikeRequestByUser', data.requestId, redis.print);
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data paymentSuccess");}
    });

    socket.on('paymentFailed', function(data) {// TODO:
      if(data.jwt && data.requestId){
        try {
          console.log('paymentFailed');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data paymentFailed");}
    });

    socket.on('payCash', function(data) {
      if(data.jwt && data.requestId && data.total){
        try {
          console.log('payCash');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          dbs.updatePaymentMode(db, requestId, 'cash', function(results){});

          rClient.hget('bikeRequestByMech', data.requestId, function(error, phone){
            if(!error){
              socket.to(bikeMechMap[String(phone)]).emit('receivePayment', {total:data.total});
            } else {
              console.log(error);
              throw error;
            }
          });

          socket.emit('pc');
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data payCash");}
    });

    socket.on('paymentReceived', function(data) {
      if(data.jwt && data.requestId){
        try {
          console.log('paymentReceived');
          var decoded = jwt.verify(data.jwt,'741852963skr');
          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          dbs.updatePaymentMode(db, requestId, 'paidCash', function(results){});

          rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
            if(!error){
              dbs.getUserRedeem(db, String(phone), function(results){
                socket.to(userMap[String(phone)]).emit('redeemed', {amount : results[0].redeem});
              });
              socket.to(userMap[String(phone)]).emit('paymentSuccess');
            } else {
              console.log(error);
              throw error;
            }
          });

          dbs.bikeMechanicOnline(db, decoded.phone, function(results){});
          socket.emit('paymentComplete');
          rClient.srem('bikeRequestMap', data.requestId, redis.print);//ToDo:redis.print or callback?
          rClient.hdel('bikeRequestByMech', data.requestId, redis.print);
          rClient.hdel('bikeRequestByUser', data.requestId, redis.print);
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data paymentReceived");}
    });

    socket.on('bikeFeedback', function(data) {
      if(data.jwt && data.requestId && data.mechRating && data.serviceRating){
        try {
          console.log('bikeFeedback');
          var decoded = jwt.verify(data.jwt,'741852963skr');

          var ObjectID = require('mongodb').ObjectID;
          var requestId = new ObjectID(data.requestId);

          dbs.saveBikeFeedback(db, requestId, data.mechRating, data.serviceRating, data.description, function(results){
            socket.emit('feedbackSaved');
          });
        } catch(err) {
          console.log(err);
        }
      } else {console.log("invalid data bikeFeedback");}
    });

   socket.on('cancelBike', function(data) {// TODO: differentiate client
     if(data.jwt && data.requestId && data.description){
       console.log('cancelBike');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         dbs.cancelBike(db, requestId, function(results){
           socket.emit('bikeCancelled');
         });

         rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){//differentiate client
           if(!error){
             socket.to(userMap[String(phone)]).emit('bikeCancelled');
           } else {
             console.log(error);
             throw error;
           }
         });

         rClient.hexists('bikeRequestByMech', data.requestId, function(error, exists){
           if(!error){
             if(exists == 1){
               rClient.hget('bikeRequestByMech', data.requestId, function(error, phone){
                 if(!error){
                   dbs.bikeMechanicOnline(db, String(phone), function(results){
                     socket.to(bikeMechMap[String(phone)]).emit('bikeCancelled');
                   });
                   rClient.hdel('bikeRequestByMech', data.requestId, redis.print);
                 } else {
                   console.log(error);
                   throw error;
                 }
               });
             }
           } else {
             console.log(error);
             throw error;
           }
         });

         rClient.srem('bikeRequestMap', data.requestId, redis.print);//ToDo:redis.print or callback?
         rClient.hdel('bikeRequestByUser', data.requestId, redis.print);
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data cancelBike");}
   });

   socket.on('getNews', function(data) {//user related push notification for sustained user interaction
     if(data.jwt){
       console.log('getNews');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         dbs.getNews(db, function(results){
           socket.emit('news', {results:results})
           console.log(results[0]);
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data getNews");}
   });

   socket.on('getOffers', function(data) {//user related push notification for sustained user interaction
     if(data.jwt){
       console.log('getOffers');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         dbs.getOffers(db, function(results){
           socket.emit('offers', {results:results})
           console.log(results[0]);
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data getOffers");}
   });

   socket.on('getReportedList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getReportedList');
         dbs.getReportedList(db, function(results){
           socket.emit('reportedList', {results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getReportedList");}
   });

   socket.on('getScheduled', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getScheduledMap');
         dbs.getScheduled(db, function(results){
           socket.emit('scheduled', {results:results});//location,scheduleDate,phone
           console.log(results[0]);
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getScheduled");}
   });

   socket.on('getScheduledList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getScheduledList');
         dbs.getScheduledList(db, function(results){
           socket.emit('scheduledList', {results:results});//_id,fname,lname,location,scheduleDate,phone,bikeDetails,typeOfService
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getScheduledList");}
   });

   socket.on('getActive', function(data){//ToDo:timeElapsed/startTime
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getActiveMap');
         dbs.getActive(db, function(results){
           socket.emit('active', {results:results});//location,phone,status
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getActive");}
   });

   socket.on('getActiveList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getActiveList');
         dbs.getActiveList(db, function(results){
           socket.emit('activeList', {results:results});//_id,fname,lname,location,insStatus,mfname,mlname,phone,bikeDetails,typeOfService
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getActiveList");}
   });

   socket.on('getActivependingList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getActivependingList');
         dbs.getPendingList(db, function(results){
           socket.emit('activependingList', {results:results});//_id,fname,lname,location,phone ,scheduleDate,bikeDetails,typeOfService
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getActiveList");}
   });

   socket.on('getActiveRequest', function(data){
     if(data.jwt && data.requestId && data.mechId){
       console.log("getActiveReqest");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         var bikeMech;
         dbs.bikeMech(db, data.mechId, function(results){//fname,lname,phone,vehicleNo,rating
           bikeMech = results;
         });

         dbs.getActiveRqst(db, requestId, function(results){
           socket.emit('activeRequest', {results:results, bikeMech:bikeMech});//_id,fname,lname,phone,bikeDetails,location,insStatus
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getActiveRqst");}
   });


   socket.on('getCompleted', function(data){//ToDo:completedDate
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getCompleted');
         dbs.getCompleted(db, function(results){
           socket.emit('completed', {results:results});//loc,phone
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getCompleted");}
   });

   socket.on('getCompletedList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getCompletedList');
         dbs.getCompletedList(db, function(results){
           socket.emit('completedList', {results:results});//_id,fname,lname,location,insStatus,mfname,mlname,mechId,bikeDetails,typeOfService
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getCompletedList");}
   });

   socket.on('getCompletedRequest', function(data){
     if(data.jwt && data.requestId && data.mechId){
       console.log("getCompletedRequest");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         var bikeMech;
         dbs.bikeMech(db, data.mechId, function(results){//fname,lname,phone,vehicleNo,rating
           bikeMech = results;
         });

         dbs.getCompletedRqst(db, requestId, function(results){
           socket.emit('completedRequest', {results:results, bikeMech:bikeMech});//_id,fname,lname,phone,bikeDetails,location,insStatus
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getCompletedRqst");}
   });

   socket.on('getOnlineBikeMechs', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getOnlineBikeMechs map');
         dbs.getBikeMechs(db, 'online', function(results){
           socket.emit('onlineBikeMechs', {results:results});//location,phone,fname,lname
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getOnlineBikeMechs");}
   });

   socket.on('getOnlineBikeMechsList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getOnlineBikeMechsList');
         dbs.getOnlineBikeMechsList(db, function(results){// no of serv ,rating
           socket.emit('onlineBikeMechsList', {results:results});//fname,lname,phone,expertise
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getOnlineBikeMechsList");}
   });

   socket.on('getBikeMechProfile', function(data){
     if(data.jwt && data.phone){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getBikeMechProfile');
         dbs.mechServicesCompleted(db, data.phone, function(results){
           socket.emit('mechcompleted', {results:results});//loc,phone
         });
         dbs.getBikeMechProfile(db, data.phone,  function(results){
           socket.emit('bikeMechProfile',{results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data getBikeMechProfile");}
   });

   socket.on('getBikeMech', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         /*var servicesList;
         dbs.bikeMechServices(db, data.phone, function(results){
           servicesList = results;
         });*/

         dbs.getBikeMech(db, decoded.phone, function(results){
           socket.emit('bikeMechProfile', {results:results});//fname,lname,phone,expertise,servicesDone(complete)
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getBikeMech");}
   });

   socket.on('getBusyBikeMechs', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getBusyBikeMechs map');
         dbs.getBikeMechs(db, 'busy', function(results){
           socket.emit('busyBikeMechs', {results:results});//location,phone,fname,lname
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getBusyBikeMechs");}
   });

   socket.on('getOfflineBikeMechs', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getOfflineBikeMechs map');
         dbs.getBikeMechs(db, 'offline', function(results){
           socket.emit('offlineBikeMechs', {results:results});//location,phone,fname,lname
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getOfflineBikeMechs");}
   });

   socket.on('getOfflineBikeMechsList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getOfflineBikeMechsList');
         dbs.getBikeMechsList(db, 'offline', function(results){
           socket.emit('offlineBikeMechsList', {results:results});//fname,lname,phone,expertise
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getOfflineBikeMechsList");}
   });

   socket.on('deactivateBikeMech', function(data){
     if(data.jwt && data.phone){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.deactivateBikeMech(db, data.phone, function(results){
           socket.to(bikeMechMap[data.phone]).emit('deactivatedBikeMech');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on deactivateBikeMech");}
   });

   socket.on('suspendBikeMech', function(data){
     if(data.jwt && data.phone){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');

         dbs.suspendBikeMech(db, data.phone, function(results){
           socket.to(bikeMechMap[data.phone]).emit('suspendedBikeMech');
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on suspendBikeMech");}
   });

   socket.on('suspendBike', function(data) {
     if(data.jwt && data.requestId){//description
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         dbs.suspendBike(db, requestId, function(results){
           //console.log(results);
           socket.emit('bikeSuspended');
         });
         //delete bikeRequestByUser[requestId];
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data suspendBike");}
   });

   socket.on('reScheduleBike', function(data) {
     if(data.jwt && data.requestId && data.date && data.time){
       console.log('reScheduleBike: ', data.date, data.time);
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);
         var dd = Number(data.date.substring(0,2));
         var mm = Number(data.date.substring(3,5));
         var yy = Number(data.date.substring(6,8));
         var hr = Number(data.time.substring(0,2));
         var min = Number(data.time.substring(3,5));

         var reDate = new Date(yy, mm, dd, hr, min);
         var date = new Date(); //ToDo
         var timeOut = Math.abs((date.getTime() - reDate.getTime()) / 1000);

         dbs.reScheduleBike(db, requestId, reDate, function(results){
           console.log(results.ops);
           socket.emit('reScheduledBike');
         });

         setTimeout(function() {
           //ToDo:assign the request to operator/admin when automated
         }, timeOut);
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data reScheduleBike");}
   });

   socket.on('changeBikeMech', function(data) {
     if(data.jwt && data.requestId && data.mechId && data.newMechId){
       console.log('changeBikeMech');
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);
         var ph;

         rClient.hget('bikeRequestByUser', data.requestId, function(error, phone){
           if(!error){
             ph = String(phone);
           } else {
             console.log(error);
             throw error;
           }
         });

         rClient.hset('bikeRequestByMech', data.requestId, data.newMechId, redis.print);//ToDo:redis.print or callback?

         dbs.changeBikeMech(db, requestId, data.mechId, data.newMechId, function(results){
           socket.emit('bikeMechChanged');
           //ToDo:if(insStatus){socket.to(bikeMechMap[bikeRequestByMech[requestId]]).emit('bikeMechChanged');}
           //ToDo:socket.to(userMap[bikeRequestByUser[requestId]].emit('bikeMechChanged',{mechId:data.newMechId});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data changeBikeMech");}
   });

   socket.on('assign', function(data) {//push notification
     if(data.jwt && data.requestId && data.mechId && data.location && data.phone && data.fname && data.lname && data.bikeDetails && data.typeOfService){
       try {
         console.log('assign');
         var loc = data.location.map(Number);
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);
         var userProfile =[data.phone,data.fname, data.lname];
         //rClient.hset('bikeRequestByAdmin', data.requestId, decoded.key, redis.print);

         socket.to(bikeMechMap[data.mechId]).emit('bikeRepairRequest',{requestId:requestId, location:loc, profile:userProfile, typeOfService:data.typeOfService, bikeDetails: data.bikeDetails});
         socket.emit('assigned');
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data assign");}
   });

   socket.on('getDelegatedList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getDelegatedList');
         dbs.getDelegatedList(db, function(results){
           console.log('delegatedList: ', results)
           socket.emit('delegatedList', {results:results});//_id,fname,lname,phone,location,mechId,mfname,mlname,bikeDetails,typeOfService
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getDelegatedList");}
   });

   socket.on('getApprovedList', function(data){
     if(data.jwt){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         console.log('getApprovedList');
         dbs.getApprovedList(db, function(results){
           socket.emit('approvedList', {results:results});//_id,fname,lname,location,insStatus,mfname,mlname,bikeDetails,typeOfService
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getApprovedList");}
   });

   socket.on('getInsRequest', function(data){
     if(data.jwt && data.requestId ){
       console.log("getinsReqest");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         dbs.getInsRqst(db, requestId, function(results){
           socket.emit('insRequest', {results:results});//_id,fname,lname,phone,bikeDetails,location,insStatus
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getActiveRqst");}
   });

   socket.on('getApprovedrqst', function(data){
     if(data.jwt && data.requestId){
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);
         console.log('getApprovedrqst');
         dbs.getApprovedrqst(db,requestId, function(results){
           socket.emit('approvedrqst', {results:results});
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getApprovedList");}
   });

   socket.on('getActiveCheck', function(data){
     if(data.jwt && data.requestId && data.mechId){
       console.log("getActiveCheck");
       try {
         var decoded = jwt.verify(data.jwt,'741852963skr');
         var ObjectID = require('mongodb').ObjectID;
         var requestId = new ObjectID(data.requestId);

         var bikeMech;
         dbs.bikeMech(db, data.mechId, function(results){//fname,lname,phone,vehicleNo,rating
           bikeMech = results;
         });

         dbs.getActiveRqst(db, requestId, function(results){
           socket.emit('getActiveCheck', {results:results, bikeMech:bikeMech});//_id,fname,lname,phone,bikeDetails,location,insStatus
         });
       } catch(err) {
         console.log(err);
       }
     } else {console.log("invalid data on getActiveRqst");}
   });


});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});
