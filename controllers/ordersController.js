const _ = require('lodash') 
const ProductModel = require('../models/products')
const ProductRatingModel = require('../models/product_ratings')
const UserModel = require('../models/users')
const shoppingCartModel = require('../models/shopping_cart')
const orderModel = require('../models/orders')
const querystring = require('querystring')  
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc')
const uuid = require('uuid')


const controllers = {
showOrders: (req, res) => {
    let referenceNum=req.params.reference
    
    orderModel.findOne(
        {
            orderReference: referenceNum
        },
    )
        .then(orderResult => {
            res.render("orders/show",{
                pageTitle: "Orders",
                name: orderResult.mailToName,
                orders: orderResult,
            })
        })
        .catch(err => {
            res.send(err)
        })
},
}

module.exports = controllers