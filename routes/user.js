const express = require('express');
const morgan = require('morgan');
const router = express.Router();
const User = require("../models").User;
const Sequelize = require('sequelize');
const authenticate = require('./auth');
const bcryptjs = require('bcryptjs');


/* GET current user*/
router.get('/', authenticate, (req, res) => {
  res.status(200);
  //Bring back formatted JSON data
  res.json({
      id: req.currentUser.id,
      firstName: req.currentUser.firstName,
      lastName: req.currentUser.lastName,
      emailAddress: req.currentUser.emailAddress,
  });
});

/* POST create user. */
router.post('/', (req, res, next) => {
  if (!req.body.emailAddress) {
    const err = new Error('Please enter sufficient credentials.');
    err.status = 400;
    next(err);
  } else {
    User.findOne({ where: { emailAddress: req.body.emailAddress } })
      .then(user => {
        if (user) {
          const err = new Error('This user already exists.')
          //Bad request
          err.status = 400;
          next(err);
          //If user doesn't exist
        } else {
          //Create new user object
          const newUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.password
          };//bcrypt will has the new user's password in the database
            newUser.password = bcryptjs.hashSync(newUser.password);
          //Create new user
          User.create(newUser)
            .then (() => {
              //set the location header
              res.location('/');
              //create status of no content
              res.status(201).end();
            })
            //Catch errors
            .catch(err => {
              err.status = 400;
              next(err);
            });
        }
      })
      //Catch errors
      .catch(err => {
        err.status = 400;
        next(err);
      });
  }
});


module.exports = router;
