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
    listCartItems: (req, res) => {
        // using the promise way
        shoppingCartModel.findOne(
            {
                email: req.session.user.email
            }
        )
            .then(results => {
                res.render('shopping-cart/index', {
                    pageTitle: "My Orders",
                    products: results
                })
            })
            .catch(err => {
                res.send(err)
            })

        // callback way
        // ProductModel.find({}, (err, doc) => {
        //     res.render('products/index', {
        //         pageTitle: "List of Baked Goods",
        //         bakegoods: doc
        //     })
        // })
    },
    addItemToCart: (req, res) => {
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
                        if (! result) {
                            res.redirect('/products' + slug)
                            return
                        }
                        shoppingCartModel.findOne(
                            {
                                email:req.session.user.email
                            },
                        )
                            .then(shoppingCartResult=>{     
                                // check if array is empty
                                if(shoppingCartResult.addedItemsSlug.length===0){
                                    shoppingCartModel.findOneAndUpdate(
                                        {
                                            email:req.session.user.email
                                        },
                                        {
                                            $push: {

                                                addedItemsName: productResult.name,
                                                addedItemsPrice: productResult.price,
                                                addedItemsImage: productResult.image,
                                                addedItemsSlug: slug,
                                                addedItemsQty: 1
                                            },
                                        }
                                        
                                    )
                                        .then(result=>{
                                            const query = querystring.stringify({
                                                "result": "success"
                                            })
                                            res.redirect('/products/' + slug + '/?' + query)
                                        })
                                        .catch(err => {
                                            res.send(err)
                                        })
                                }
                                else{
                                    let index=shoppingCartResult.addedItemsSlug.findIndex( itemSlug=> itemSlug==slug)
    
                                    if(index===-1){
                                        shoppingCartModel.findOneAndUpdate(
                                            {
                                                email:req.session.user.email
                                            },
                                            {
                                                $push: {
                                                    addedItemsName: productResult.name,
                                                    addedItemsPrice: productResult.price,
                                                    addedItemsImage: productResult.image,
                                                    addedItemsSlug: slug,
                                                    addedItemsQty: 1
                                                },
                                            }
                                            
                                        )
                                            .then(result=>{
                                                const query = querystring.stringify({
                                                    "result": "success"
                                                })
                                                res.redirect('/products/' + slug + '/?' + query)
                                            })
                                            .catch(err => {
                                                res.send(err)
                                            })
                                    }
                                    else{
                                        let qtyArr = shoppingCartResult.addedItemsQty
                                        qtyArr[index] = qtyArr[index]+1
                                        shoppingCartModel.findOneAndUpdate(
                                            {
                                                email:req.session.user.email
                                            },
                                            {
                                                
                                                addedItemsQty: qtyArr
                                                
                                            }
                                            
                                        )
                                            .then(result=>{
                                                const query = querystring.stringify({
                                                    "result": "success"
                                                })
                                                res.redirect('/products/' + slug + '/?' + query)
                                            })
                                            .catch(err => {
                                                res.send(err)
                                            })
                                    }       
                                }                                
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
    removeFromCart: (req, res) => {
        let slug = req.params.slug
        shoppingCartModel.findOne(
            {
                email: req.session.user.email
            }
        )
            .then(shoppingCartResult => {
                let index=shoppingCartResult.addedItemsSlug.findIndex( itemSlug=> itemSlug===slug)
                shoppingCartResult.addedItemsName.splice(index,1)
                shoppingCartResult.addedItemsPrice.splice(index,1)
                shoppingCartResult.addedItemsImage.splice(index,1)
                shoppingCartResult.addedItemsSlug.splice(index,1)
                shoppingCartResult.addedItemsQty.splice(index,1)
                
                shoppingCartModel.findOneAndUpdate(
                    {
                        email:req.session.user.email
                    },
                    {
                        addedItemsName: shoppingCartResult.addedItemsName,
                        addedItemsPrice: shoppingCartResult.addedItemsPrice,
                        addedItemsImage: shoppingCartResult.addedItemsImage,
                        addedItemsSlug: shoppingCartResult.addedItemsSlug,
                        addedItemsQty: shoppingCartResult.addedItemsQty,
                    }
                    
                )
                    .then(result=>{
                        res.redirect('/cart')
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
        res.render("payment/checkout",{
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
                email: req.session.user.email
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
                    status: "Pending payment",

                })
                    .then(result=>{
                        shoppingCartModel.findOneAndUpdate(
                            {
                                email:req.session.user.email
                            },
                            {
                                addedItemsName: [],
                                addedItemsPrice: [],
                                addedItemsImage: [],
                                addedItemsSlug: [],
                                addedItemsQty: [],
                            }
                            
                        )
                            .then(result=>{
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
    payment: (req, res) => {
        console.log(req.query)
        let checkoutObj={
            price_data: {
                currency: 'sgd',
                product_data: {
                  name: null,
                  images: [],
                },
                unit_amount: null,
              },
              quantity: null,
        }
        let checkoutObjArr=[]
        let imgArr=[]
        orderModel.findOne(
            {
                orderReference: req.query.reference
            }
        )
            .then(orderResults => {
                orderResults.addedItemsImage.forEach(image=>{
                    imgArr.push(image)
                })
                orderResults.addedItemsSlug.forEach((item, index)=>{
                    checkoutObj={
                        price_data: {
                            currency: 'sgd',
                            product_data: {
                              name: orderResults.addedItemsName[index],
                              images: [orderResults.addedItemsImage[index]],
                            },
                            unit_amount: orderResults.addedItemsPrice[index]*100,
                          },
                          quantity: orderResults.addedItemsQty[index],
                    }
                    checkoutObjArr.push(checkoutObj)
                })
                stripe.checkout.sessions.create({
                        payment_method_types: ['card'],
                        line_items:checkoutObjArr,
                        mode: 'payment',
                        success_url: "https://young-sands-87308.herokuapp.com//payment/success/?" + "reference=" + orderResults.orderReference,
                        cancel_url: "https://young-sands-87308.herokuapp.com//payment/cancel/",
                      })
                      .then(session=>{
                        res.json({ id: session.id });
                      })       
                      .catch(err => {
                        res.send(err)
                      })           
            })
            .catch(err => {
                res.send(err)
            })     
      },
      paymentSuccess: (req, res) => {
          // generate uuid as salt
          const salt = uuid.v4()
          orderModel.findOne(
            {
                orderReference: req.query.reference
            }
        )
            .then(orderResult => {
                orderModel.findOneAndUpdate(
                    {
                        orderReference: req.query.reference
                    },
                    {
                        status: "Payment done"
                    }
                )
            
                    .then(result=>{
                        res.render("payment/success",{
                            pageTitle: "Payment completed",
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
      paymentCancel: (req, res) => {
        
        res.render("payment/cancel",{
            pageTitle: "Payment cancelled",
        })
      },
}

module.exports = controllers