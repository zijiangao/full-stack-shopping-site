const uuid = require('uuid')
// const bcrypt = require('bcrypt')
const SHA256 = require("crypto-js/sha256")
const UserModel = require('../models/users')
const shoppingCartModel = require('../models/shopping_cart')
const orderModel = require('../models/orders')

const controllers = {

    showRegistrationForm: (req, res) => {
        res.render('users/register', {
            pageTitle: 'Register as a User'
        })
    },

    showLoginForm: (req, res) => {
        res.render('users/login', {
            pageTitle: 'User Login'
        })
    },

    register: (req, res) => {
        // validate the users input
        // not implemented yet, try on your own

        UserModel.findOne({
            email: req.body.email
        })
            .then(result => {
                // if found in DB, means email has already been take, redirect to registration page
                if (result) {
                    res.redirect('/users/register')
                    return
                }

                // no document found in DB, can proceed with registration

                // generate uuid as salt
                const salt = uuid.v4()

                // hash combination using bcrypt
                const combination = salt + req.body.password

                // hash the combination using SHA256
                const hash = SHA256(combination).toString()

                // create user in DB
                UserModel.create({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    pwsalt: salt,
                    hash: hash
                })
                    .then(createResult => {
                        shoppingCartModel.create({
                            email: req.body.email
                        })
                            .then(result=>{
                                res.redirect('/products')
                            })
                            .catch(err => {
                                res.redirect('/users/register')
                            })   
                    })
                    .catch(err => {
                        res.redirect('/users/register')
                    })
            })
            .catch(err => {
                console.log(err)
                res.redirect('/users/register')
            })
    },

    login: (req, res) => {
        // validate input here on your own

        // gets user with the given email
        UserModel.findOne({
            email: req.body.email
        })
            .then(result => {
                // check if result is empty, if it is, no user, so login fail, redirect to login page
                if (!result) {
                    console.log('err: no result')
                    res.redirect('/users/login')
                    return
                }

                // combine DB user salt with given password, and apply hash algo
                const hash = SHA256(result.pwsalt + req.body.password).toString()

                // check if password is correct by comparing hashes
                if (hash !== result.hash) {
                    console.log('err: hash does not match')
                    res.redirect('/users/login')
                    return
                }

                // login successful

                // set session user
                req.session.user = result

                res.redirect('/users/dashboard')
            })
            .catch(err => {
                console.log(err)
                res.redirect('/user/login')
            })
    },

    dashboard: (req, res) => {
        if(req.session.user.email==="gaozijian1990@gmail.com"){
            orderModel.find(
                {
   
                },
                {},
                {
                    sort: {
                        created_at: -1
                    }
                }
            )
                .then(orderResults=>{
                    shoppingCartModel.findOne(
                        {
                            email:req.session.user.email
                        }
                    )
                        .then(shoppingCartResult=>{
                            res.render('users/dashboard', {
                                pageTitle: 'User Dashboard',
                                orders: orderResults,
                                products: shoppingCartResult,
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            res.redirect('/products')
                        })
                    
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/products')
                }) 
        }
        else{
            orderModel.find(
                {
                    email:req.session.user.email
                },
                {},
                {
                    sort: {
                        created_at: -1
                    }
                }
            )
                .then(orderResults=>{
                    shoppingCartModel.findOne(
                        {
                            email:req.session.user.email
                        }
                    )
                        .then(shoppingCartResult=>{
                            res.render('users/dashboard', {
                                pageTitle: 'User Dashboard',
                                orders: orderResults,
                                products: shoppingCartResult,
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            res.redirect('/products')
                        })
                    
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/products')
                })   
        }
            
    },

    logout: (req, res) => {
        req.session.destroy()
        res.redirect('/users/login')
    }

}

module.exports = controllers