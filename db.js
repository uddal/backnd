function saveUser(db, firstName, lastName, location, phone, jwt, playerId, callback){// TODO:p1
  db.collection('users').insertOne({fname:firstName, lname:lastName, installedLoc:location, phone:phone, jwt:jwt, playerId:playerId, credits:10}, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      return callback(results); //ToDo:return callback
    }
  });

  db.collection('users').createIndex({ location : "2dsphere"}, function(err, result) {
    if(err){console.log('error in indexing users',err);}
  });
}

function getRequestId(db, phone, callback){
  db.collection('bikeRequests').find({ $and : [ {phone : phone}, {fbs : ''}, {status:{$ne:'cancelled'}} ]},
  {projection:{_id:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getUserName(db, phone, callback){
  db.collection('users').find({phone : phone},{projection:
    {
      _id:0,
      fname:1,
      lname:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function updateUser(db, phone, jwt, playerId, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $set: {
          playerId : playerId,
          jwt : jwt
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function getUserProfile(db, phone, callback){
  db.collection('users').find({phone : phone},{projection:
    {
      _id:0,
      fname:1,
      lname:1,
      phone:1,
      email:1,
      bikes:1,
      cars:1,
      places:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function updateUserPhone(db, phone, newPhone, jwt, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $set: {
          phone : newPhone,
          jwt : jwt
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function updateUserfName(db, phone, firstName, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $set: {
          fname : firstName
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function updateUserlName(db, phone, lastName, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $set: {
          lname : lastName
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function updateUserMail(db, phone, email, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $set: {
          email : email
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function updateUserPlaces(db, phone, address, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $addToSet: {
          places : address//errorCheck
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function updateUserBikes(db, phone, bike, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $addToSet: {
          bikes : bike//errorCheck
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function updateUserCars(db, phone, car, callback){
  db.collection('users').updateOne({
    phone: phone
   }, {
     $addToSet: {
          cars : car//errorCheck
     }
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else {
       return callback(results);
     }
   }
  );
}

function getUserScheduledRequests(db, phone, callback){
  db.collection('bikeRequests').find({ $and : [ {$or : [ {status : 'scheduled'}, {status : 'engaged'} ]}, {phone : phone} ]},{projection:
    {
      _id:0,
      mfname:1,
      mlname:1,
      scheduleDate:1,
      status:1,
      bikeDetails:1,
      typeOfService:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getUserServiceHistoryList(db, phone, callback){//ToDo:get from users collection
  db.collection('bikeRequests').find({ $and : [ {$or : [ {status : 'completed'}, {status : 'reported'} ]}, {phone : phone} ]},{projection:
    {
      mfname:1,
      mlname:1,
      status:1,
      bikeDetails:1,
      typeOfService:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getUserServiceHistory(db, requestId, callback){
  db.collection('bikeRequests').find({_id : requestId},{projection:
    {
      _id:0,
      status:1,
      servicedList:1,
      finalLabourCharge:1,
      finalSpareCharge:1,
      gst:1,
      total:1,
      promoCode:1,
      description:1,
      problems:1,
      corrections:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function saveBikeMech(db, firstName, lastName, location, phone, jwt, callback){
  db.collection('bikeMechs').insertOne({
    fname:firstName,
    lname:lastName,
    location:location,
    phone:phone,
    status:'offline',
    vehicleNo:'TS 1234',//ToDo
    expertise:'allrounder',//ToDo
    rating:5,//ToDo
    jwt:jwt}, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      return callback(results);
    }
  });

  db.collection('bikeMechsOnline').createIndex({ location : "2dsphere"}, function(err, result) {
    if(err){console.log('error in indexing users',err);}
  });
}

function getBikeMechProfile(db, phone, callback){
  db.collection('bikeMechs').find({
    phone : phone
  }).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getBikeRequestStatus(db, requestId, callback){
  db.collection('bikeRequests').find({_id : requestId}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function bikeMechOnline(db, phone, location, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         status : 'online'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikeMechsOnline').insertOne({phone:phone, location:location}, function(err, results) {//todo:check for duplicates
         if (err) {
             console.log(err);
         } else {
             //callback(results);
         }
     });
}

function bikeMechanicOnline(db, phone, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         status : 'online'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikeMechsOnline').insertOne({phone:phone}, function(err, results) {//todo:check for duplicates
         if (err) {
             console.log(err);
         } else {
             //callback(results);
         }
     });
}

function bikeMechOffline(db, phone, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         status : 'offline'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikeMechsOnline').deleteOne({phone:phone}, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             //callback(results);
         }
     });
}

function fetchBikeMech(db, location, callback){
  db.collection('bikeMechsOnline').find({
    location: {
             $geoNear: {
                     type : "Point",
                     coordinates : location
             } , $maxDistance: 7000
         }
     }).toArray(function(err, results) {
            if (err) {
                console.log('no mechanics at the moment or error in fetching',err);
            } else {
                return callback(results);
            }
  });
}

function saveShedBikeReq(db, requestId, fname, lname, phone, location, scheduleDate, requestDate, bikeDetails, typeOfService, callback){
  db.collection('bikeRequests').insertOne({
    _id : requestId,
    fname : fname,
    lname : lname,
    phone : phone,
    location : location,
    scheduleDate : scheduleDate,
    requestDate : requestDate,
    status : 'scheduled',
    bikeDetails : bikeDetails,
    typeOfService : typeOfService
  }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            return callback(results);
        }
    });
}

function saveBikeRequest(db, requestId, fname, lname, phone, location, requestDate, bikeDetails, typeOfService, callback){
  db.collection('bikeRequests').insertOne({
    _id:requestId,
    fname:fname,
    lname:lname,
    phone:phone,
    location:location,
    requestDate : requestDate,
    bikeDetails : bikeDetails,
    typeOfService : typeOfService,
    status : 'pending',
    payMode : '',
    fbs : ''
  }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            return callback(results);
        }
    });
}

function bikeRequestPending(db, requestId, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         status : 'pending'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function saveCarRequest(db, fname, lname, phone, location, callback){
  db.collection('carRequests').insertOne({fname:fname, lname:lname, phone : phone, location : location}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            return callback(results);
        }
    });
}

function bikeRequestUpdate(db, requestId, mechId, mfname, mlname, mBike, mPic, startTime, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         status : 'engaged',
         mechId : mechId,
         mfname : mfname,
         mlname : mlname,
         mBike : mBike,
         mPic : mPic,
         startTime : startTime
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function bikeMechBusy(db, phone, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         status : 'busy'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikeMechsOnline').deleteOne({phone:phone}, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             //callback(results);
         }
     });
}

function updateBikeMechLoc(db, phone, location, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         location : location
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection("bikeMechsOnline").updateOne({
      phone: phone, phone: {$exists: true}
  }, {
      $set: {
          location : location
      }
  }, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            //callback(results);
        }
    });
}

function updateBikeInsStatus(db, requestId, status, callback){
  db.collection("bikeRequests").updateOne({
       _id: requestId
   }, {
       $set: {
           insStatus : status
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function delegateBike(db, requestId, callback){
  db.collection("bikeRequests").updateOne({
       _id: requestId
   }, {
       $set: {
           delegated : 'yes'
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function reportBikeRequest(db, requestId, problems, description, callback){
  db.collection("bikeRequests").updateOne({
       _id: requestId
   }, {
       $set: {
           status : 'reported',
           description : description
       },
       $push: {problems : problems}
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function saveHelp(db, phone, fname, lname, problems, callback){
  db.collection('help').insertOne({fname:fname, lname:lname, phone:phone, problems:problems}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            return callback(results);
        }
    });
}

function rectifyBikeRequest(db, requestId, correction, callback){
  db.collection("bikeRequests").updateOne({
       _id: requestId
   }, {
       $set: {status : 'completed'},
       $push: {corrections : correction}
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function saveBikeJobcard(db, requestId, jobCard, callback){
  db.collection('bikeRequests').updateOne({
     _id: requestId
 }, {
     $set: {
         jobCard : jobCard,
         insStatus : 'ie'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function saveBikeServiceList(db, requestId, serviceList, labourCharge, spareCharge, callback){
  db.collection('bikeRequests').updateOne({
     _id: requestId
 }, {
     $set: {
         serviceList : serviceList,
         labourCharge : labourCharge,
         spareCharge : spareCharge,
         insStatus : 'sr'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function bikeReqStatusUpdate(db, requestId, servicedList, finalLabourCharge, finalSpareCharge, gst, total, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         servicedList : servicedList,
         finalLabourCharge : finalLabourCharge,
         finalSpareCharge : finalSpareCharge,
         status: 'completed',
         insStatus : 'se',
         gst : gst,
         total : total
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikePayments').insertOne({
       _id : requestId,
       labourCharge : finalLabourCharge,
       spareCharge : finalSpareCharge
     }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             //return callback(results);
         }
     });
}

function updateUserCredits(db, phone, credits, callback){
  db.collection("users").updateOne({
       phone: phone
   }, {
       $set: {
           credits : credits
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function getUserCredits(db, phone, callback){
  db.collection('users').find({phone : phone},{projection:
  {_id:0, credits:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function updateUserRedeem(db, phone, credits, redeem, callback){
  db.collection("users").updateOne({
       phone: phone
   }, {
       $set: {
           credits : credits,
           redeem : redeem
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function updatePaymentBike(db, requestId, code, gst, total, callback){
  db.collection("bikePayments").updateOne({
       _id: requestId
   }, {
       $set: {
           promoCode : code,
           gst : gst,
           total : total
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });

    db.collection("bikeRequests").updateOne({
         _id: requestId
     }, {
         $set: {
             promoCode : code,
             total : total
         }
     }, function(err, results) {
           if (err) {
               console.log(err);
           } else {
               //return callback(results);
           }
       });
}

function updatePaymentMode(db, requestId, status, callback){
  db.collection("bikeRequests").updateOne({
       _id: requestId
   }, {
       $set: {
           payMode : status
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function saveBikePayment(db, requestId, orderId, callback){
  db.collection("bikePayments").updateOne({
       _id: requestId
   }, {
       $set: {
           orderId : orderId
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function updateBikePayment(db, requestId, paymentId, signature, callback){
  db.collection("bikePayments").updateOne({
       _id: requestId
   }, {
       $set: {
           paymentId : paymentId,
           signature : signature
       }
   }, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             return callback(results);
         }
     });
}

function getUserRedeem(db, phone, callback){
  db.collection('users').find({phone : phone},{projection:
  {_id:0, redeem:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function cancelBike(db, requestId, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         status : 'cancelled'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function saveBikeFeedback(db, requestId, mechRating, serviceRating, feedback, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         mechRating : mechRating,
         serviceRating : serviceRating,
         feedback : feedback,
         fbs : 'submitted'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function saveAdmin(db, firstName, lastName, phone, jwt, playerId, callback){
  db.collection('admins').insertOne({firstName:firstName, lastName:lastName, phone:phone, jwt:jwt, playerId:playerId}, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      return callback(results);
    }
  });
}

function getNews(db, callback){
  db.collection('blogs').find({}, {projection:
  {_id:0, img:1, description:1, url:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getOffers(db, callback){
  db.collection('offers').find({}, {projection:
  {_id:0, url:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getReportedList(db, callback){
  db.collection('bikeRequests').find({status : 'reported'}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getScheduled(db, callback){
  db.collection('bikeRequests').find({status : 'scheduled'}, {projection:
  {_id:0, phone:1, location:1, scheduleDate:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getScheduledList(db, callback){
  db.collection('bikeRequests').find({status : 'scheduled'}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getActive(db, callback){//ToDo:generalised func for active and completed
  db.collection('bikeRequests').find({status : 'engaged'},{projection:
  {_id:0, phone:1, location:1, status:1, startTime:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getActiveList(db, callback){
  db.collection('bikeRequests').find({status : 'engaged'},{projection:
  {
    fname:1,
    lname:1,
    location:1,
    insStatus:1,
    mfname:1,
    mlname:1,
    mechId:1,
    bikeDetails:1,
    typeOfService:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getPendingList(db, callback){
  db.collection('bikeRequests').find({status : 'pending'}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function bikeMech(db, phone, callback){
  db.collection('bikeMechs').find({phone : phone},{projection:
    {
      _id:0,
      fname:1,
      lname:1,
      phone:1,
      vehicleNo:1,
      rating:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getActiveRqst(db, requestId, callback){
  db.collection('bikeRequests').find({_id : requestId},{projection:
  {

    gst:0,
    promoCode:0
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getCompleted(db, callback){
  db.collection('bikeRequests').find({status : 'completed'},{projection:
  {_id:0,location:1, phone:1}}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getCompletedList(db, callback){
  db.collection('bikeRequests').find({ $and : [ {status : 'completed'}, {payMode : ''} ]},{projection:
  {
    fname:1,
    lname:1,
    location:1,
    mfname:1,
    mlname:1,
    mechId:1,
    bikeDetails:1,
    typeOfService:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getCompletedRqst(db, requestId, callback){
  db.collection('bikeRequests').find({_id : requestId}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getBikeMechs(db, status, callback){
  db.collection('bikeMechs').find({status : status},{projection:
  {
    _id:0,
    fname:1,
    lname:1,
    phone:1,
    location:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getBikeMechsList(db, status, callback){
  db.collection('bikeMechs').find({status : status},{projection:
    {
      _id:0,
      fname:1,
      lname:1,
      phone:1,
      expertise:1,
      rating:1,
      servicesDone:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getOnlineBikeMechsList(db, callback){
  db.collection('bikeMechs').find({status : 'online'},{projection:
    {
      _id:0,
      fname:1,
      lname:1,
      phone:1,
      status:1,
      expertise:1,
      rating:1,
      servicesDone:1
    }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function bikeMechServices(db, phone, callback){
  db.collection('bikeRequests').find({ $and : [ {status : 'completed'}, {mechId : phone} ]},{projection:
  {
    _id:0,
    fname:1,
    lname:1,
    bikeDetails:1,
    typeOfService:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getBikeMech(db, phone, callback){
  db.collection('bikeMechs').find({phone : phone},{projection:
  {
    _id:0,
    fname:1,
    lname:1,
    phone:1,
    expertise:1,
    vehicleNo:1,
    url:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function deactivateBikeMech(db, phone, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         status : 'deactivated'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikeMechsOnline').deleteOne({phone:phone}, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             //callback(results);
         }
     });
}

function suspendBikeMech(db, phone, callback){
  db.collection("bikeMechs").updateOne({
     phone: phone
 }, {
     $set: {
         status : 'suspended'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });

   db.collection('bikeMechsOnline').deleteOne({phone:phone}, function(err, results) {
         if (err) {
             console.log(err);
         } else {
             //callback(results);
         }
     });
}

function suspendBike(db, requestId, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         status : 'suspended'
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function reScheduleBike(db, requestId, scheduleDate, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         scheduleDate : scheduleDate
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function changeBikeMech(db, requestId, mechId, newMechId, callback){
  db.collection("bikeRequests").updateOne({
     _id: requestId
 }, {
     $set: {
         oldMechId : mechId,
         mechId : newMechId
     }
 }, function(err, results) {
       if (err) {
           console.log(err);
       } else {
           return callback(results);
       }
   });
}

function getDelegatedList(db, callback){
  db.collection('bikeRequests').find({ $and : [ {delegated : 'yes'}, {$or : [ {insStatus : 'is'}, {insStatus : 'ie'} ]} ] },{projection:
  {
    fname:1,
    lname:1,
    phone:1,
    location:1,
    mechId:1,
    mfname:1,
    mlname:1,
    bikeDetails:1,
    typeOfService:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getApprovedList(db, callback){
  db.collection('bikeRequests').find({ $and : [ {delegated : 'yes'}, { $or : [ {insStatus : 'sa'}, {insStatus : 'ss'} ] } ] },
  {projection:
  {
    fname:1,
    lname:1,
    phone:1,
    location:1,
    mechId:1,
    mfname:1,
    mlname:1,
    bikeDetails:1,
    typeOfService:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function mechServicesCompleted(db,phone, callback){
  db.collection('bikeRequests').find({ $and : [ {status : 'completed'}, {mechId : phone} ] },{projection:
  {
    fname:1,
    lname:1,
    location:1,
    mfname:1,
    mlname:1,
    mechId:1,
    bikeDetails:1,
    typeOfService:1
  }}).toArray(function(err, results) {
    if (err) {
      console.log('no services yet',err);
    } else {
      return callback(results);
    }
  });
}

function getInsRqst(db, requestId, callback){
  db.collection('bikeRequests').find({_id : requestId}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}

function getApprovedrqst(db, requestId, callback){
  db.collection('bikeRequests').find({_id : requestId}).toArray(function(err, results) {
    if (err) {
      console.log('no users or error in fetching',err);
    } else {
      return callback(results);
    }
  });
}


exports.saveUser = saveUser;
exports.getRequestId = getRequestId;
exports.getUserName = getUserName;
exports.updateUser = updateUser;
exports.getUserProfile = getUserProfile;
exports.updateUserPhone = updateUserPhone;
exports.updateUserfName = updateUserfName;
exports.updateUserlName = updateUserlName;
exports.updateUserMail = updateUserMail;
exports.updateUserPlaces = updateUserPlaces;
exports.updateUserBikes = updateUserBikes;
exports.updateUserCars = updateUserCars;
exports.getUserScheduledRequests = getUserScheduledRequests;
exports.getUserServiceHistoryList = getUserServiceHistoryList;
exports.getUserServiceHistory = getUserServiceHistory;
exports.saveBikeMech = saveBikeMech;
exports.getBikeMechProfile = getBikeMechProfile;
exports.bikeMechOnline = bikeMechOnline;
exports.bikeMechanicOnline = bikeMechanicOnline;
exports.bikeMechOffline = bikeMechOffline;
exports.fetchBikeMech = fetchBikeMech;
exports.saveShedBikeReq = saveShedBikeReq;
exports.saveBikeRequest = saveBikeRequest;
exports.saveCarRequest = saveCarRequest;
exports.bikeRequestUpdate = bikeRequestUpdate;
exports.bikeMechBusy = bikeMechBusy;
exports.updateBikeMechLoc = updateBikeMechLoc;
exports.updateBikeInsStatus = updateBikeInsStatus;
exports.delegateBike = delegateBike;
exports.reportBikeRequest = reportBikeRequest;
exports.saveHelp = saveHelp;
exports.rectifyBikeRequest = rectifyBikeRequest;
exports.saveBikeJobcard = saveBikeJobcard;
exports.saveBikeServiceList = saveBikeServiceList;
exports.bikeReqStatusUpdate = bikeReqStatusUpdate;
exports.updatePaymentBike = updatePaymentBike;
exports.updatePaymentMode = updatePaymentMode;
exports.saveBikePayment = saveBikePayment;
exports.updateBikePayment = updateBikePayment;
exports.cancelBike = cancelBike;
exports.saveBikeFeedback = saveBikeFeedback;
exports.saveAdmin = saveAdmin;
exports.getNews = getNews;
exports.getOffers = getOffers;
exports.getReportedList = getReportedList;
exports.getScheduled = getScheduled;
exports.getScheduledList = getScheduledList;
exports.getActive = getActive;
exports.getActiveList = getActiveList;
exports.bikeMech = bikeMech;
exports.getActiveRqst = getActiveRqst;
exports.getCompleted = getCompleted;
exports.getCompletedList = getCompletedList;
exports.getCompletedRqst = getCompletedRqst;
exports.getBikeMechs = getBikeMechs;
exports.getBikeMechsList = getBikeMechsList;
exports.getOnlineBikeMechsList = getOnlineBikeMechsList;
exports.deactivateBikeMech = deactivateBikeMech;
exports.suspendBikeMech = suspendBikeMech;
exports.suspendBike = suspendBike;
exports.reScheduleBike = reScheduleBike;
exports.changeBikeMech = changeBikeMech;
exports.getDelegatedList = getDelegatedList;
exports.getApprovedList = getApprovedList;
exports.mechServicesCompleted = mechServicesCompleted;
exports.getInsRqst = getInsRqst;
exports.getApprovedrqst = getApprovedrqst;
exports.getPendingList = getPendingList;
exports.bikeRequestPending = bikeRequestPending;
exports.getBikeMech = getBikeMech;
exports.bikeMechServices = bikeMechServices;
exports.updateUserCredits = updateUserCredits;
exports.getUserCredits = getUserCredits;
exports.updateUserRedeem = updateUserRedeem;
exports.getUserRedeem = getUserRedeem;
exports.getBikeRequestStatus = getBikeRequestStatus;
