const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        max: 100
    },
    addedItemsSlug:{
        type: [String],
        max: 100,
        default:null,
    },
    addedItemsQty:{
        type:[Number],
        max: 100,
        default:null,
    },
    addedItemsName: {
        type: [String],
        default:null,
    },
    addedItemsPrice: {
        type: [Number],
        default:null,
    },
    addedItemsImage: {
        type: [String],
        default:null,
    },

})


const CartModel = mongoose.model('Shopping_cart', cartSchema)

module.exports = CartModel