const _ = require('lodash') 
const ProductModel = require('../models/products')
const ProductRatingModel = require('../models/product_ratings')
const UserModel = require('../models/users')
const shoppingCartModel = require('../models/shopping_cart')
const orderModel = require('../models/orders')
const nodemailer = require('nodemailer')
const querystring = require('querystring')  
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc')
const ejs = require("ejs")
const uuid = require('uuid')
const result = require('dotenv').config()





const controllers = {
    buy: (req, res) => {
        let slug = req.params.slug
        UserModel.findOne({
            email: req.session.user.email
        })
            .then(result=>{
                if (! result) {
                    res.redirect('/products' + slug)
                    return
                }
                ProductModel.findOne({
                    slug: slug
                })
                    .then(productResult => {
                        if (! productResult) {
                            res.redirect('/products' + slug)
                            return
                        }
                        shoppingCartModel.create({
                            email: req.session.user.email+"-buyOnly",
                            addedItemsSlug: slug,
                            addedItemsQty: 1,
                            addedItemsName: [productResult.name],
                            addedItemsPrice: [productResult.price],
                            addedItemsImage: [productResult.image],       
                        })
                        
                            .then(result=>{     
                                res.redirect('/buy/checkout')                   
                            })
                            .catch(err => {
                                res.send(err)
                            })
                    })  
                    .catch(err => {
                        res.send(err)
                    })

                })
            .catch(err => {
                res.send(err)
            })       
    },
    checkout: (req, res) => {
        res.render("payment/buycheckout",{
            pageTitle: "Postal Information",
        })
    },
    confirmation: (req, res) => {
        let name=req.body.name
        let contactNumber=req.body["contact-number"]
        let address=req.body["address-input"]
        let unitNumber=req.body["unit-number"]
        
        // generate uuid as salt
        const salt = uuid.v4()
        shoppingCartModel.findOne(
            {
                email: req.session.user.email+"-buyOnly"
            }
        )
            .then(shoppingCartResult => {
                
                orderModel.create({
                    email: req.session.user.email,
                    orderReference:salt,
                    addedItemsSlug: shoppingCartResult.addedItemsSlug,
                    addedItemsQty: shoppingCartResult.addedItemsQty,
                    addedItemsName: shoppingCartResult.addedItemsName,
                    addedItemsPrice: shoppingCartResult.addedItemsPrice,
                    addedItemsImage: shoppingCartResult.addedItemsImage,
                    addresses: address,
                    unitNumber: unitNumber,
                    mailToName: name,
                    mailToContactNumber: contactNumber,
                    status: "Pending payment",

                })
                    .then(result=>{
                        shoppingCartModel.findOneAndDelete(
                            {
                                email:req.session.user.email+"-buyOnly"
                            }                        
                        )
                            .then(result=>{
                                const transporter = nodemailer.createTransport({
                                    service: "gmail",
                                    auth: {
                                        user: process.env.EMAIL_USER,
                                        pass: process.env.EMAIL_PASS
                                    }
                                })
                                const mailOptions = {
                                    from: "Shopping App",
                                    to: req.session.user.email,
                                    subject: 'Order confirmation for REF: ' + salt,
                                    html: "<h1>Order confirmed!</h1><p>Order details can be found <a href=\"http://localhost:5000/orders/"+salt+"\">here<a>!</p>"
                                }
                                transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                    })
                                res.render("payment/confirmation",{
                                    pageTitle: "Order Confirmation",
                                    name: name,
                                    contactNumber: contactNumber,
                                    address: address,
                                    unitNumber: unitNumber,
                                    products: shoppingCartResult,
                                    orderReference: salt,
                                })
                            })
                            .catch(err => {
                                res.send(err)
                            }) 
                    })
                    .catch(err => {
                        res.send(err)
                    })
            })
            .catch(err => {
                res.send(err)
            })
    },
}




module.exports = controllers