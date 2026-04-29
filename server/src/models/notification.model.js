import {Schema, model} from 'mongoose';


const NotificationSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    body:{
        type:String,
        required:true,
        trim:true
    },
    type:{
        type:String,
        enum:     ['price_drop', 'new_listing', 'order_update', 'promo', 'system'],
        required:true
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

module.exports = model('Notification', NotificationSchema);