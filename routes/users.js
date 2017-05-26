"use strict";

const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');


module.exports = (knex) => {

  //user home page see their lists - logged in
  router.get("/", (req, res) => {

    knex
      .select("*")
      .from("users")
      .then((results) => {
        res.json(results);
    });
  });

    //route handler for user creating an item
  router.post("/create", (req, res) => {
    let item = req.body.item
    let category = req.body.category
    let created_at = new Date()
    let item_id;

    knex('categories').select('id').where('name', category) // Selects the id from the category that matches the name of the category
      .then((id) => {

        item_id = id[0].id // Selects just the number from the array
        knex('items').insert({createdAt: created_at, name: item, categories_id: item_id, users_id: 2}) //Inserts a new row in the items table
          .then((result) => {})
      })
  });
  //route handler for register user
  router.post("/register", (req, res) => {
    //have to still check if user exists,
    //create the user knex
    let user = {
      user_name: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10), //encrypt password
      createdAt: new Date()
    }
    //insert user into the users table
    knex('users').insert(user)
      .then((resp) => {
        req.session.user = [user['email'], user['user_name']]; //set cookie upon succesful registering
        res.redirect('/');
      })
  });


  //route handler for returning list of specific catergory
  router.get("/:category", (req, res) => {

  });

  //updating the profile
  router.put("/profile", (req, res) => {

  });

  //update item from list
  router.put("/:category/:item", (req, res) => {



  });

  //delete item from list
  //should method override to delete when refactoring
  router.post("/:category/:item", (req, res) => {
    let item = req.params.item;
    let category = req.params.category;
 //   let email = req.session.user[0];

    knex
    .select('*')
    .from('categories')
    .rightOuterJoin('items', 'categories.id', 'items.categories_id')
    // .innerJoin('users', 'items.users_id', 'users.id')
    .then((result) => {
      console.log(result);
    });

    // knex('categories').select('id').where('name', category) // Selects the id from the category that matches the name of the category
    //   .then((id) => {
    //     item_id = id[0].id // Selects just the number from the array
    //     knex('users')
    //     .select('id')
    //     .where('email', email)
    //       .then((user_id) => {

    //       })

        // delete({createdAt: created_at, name: item, categories_id: item_id, users_id: 2}) //Inserts a new row in the items table
        //   .then((result) => {})


  });

  //log out user cookie session
  router.get("/logout", (req, res) => {
    req.session = null; //destroy cookie
    res.redirect('/');
  });

  router.post("/profile", (req, res) => {

  });

  router.post("/login", (req, res) => {
    if(req.body.email === "" ||  req.body.password === "" ){ //if user or pass left empty return error
      res.status(400).send("Please fill in both email and password");
      return;
    }
    let user = {
      "email": req.body.email,
      "password": req.body.password
    };
    //select all from the users table that match email address
    knex('users')
      .select()
      .where('email', user.email)
      .then((result) => {
          if(!result[0]){ //If email address does not exist in database
            console.log('1')
            res.status(403).send("Please input valid email/password");
            return;
          } else if(!(bcrypt.compareSync(user.password, result[0].password))) { //if incorrect password
            console.log('2')
            res.status(403).send("Please input valid email/password");
            return;
          } else { //correct email & password
            req.session.user = [user.email, result[0].user_name]; //set cookie if the correct email/pass
            res.redirect('/');
          }
        })
      .catch((err) =>{
        console.log(err);
      })
  });

  return router;
}

