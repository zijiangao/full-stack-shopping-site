const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        max: 100
    },
    orderReference:{
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
    addresses: String,
    unitNumber:String,
    mailToName: String,
    mailToContactNumber: String,
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    status:{
        type: String,
        required: true,
    }
})


const OrderModel = mongoose.model('Order', orderSchema)

module.exports = OrderModel