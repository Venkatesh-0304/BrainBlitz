const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type : String,
        required: true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
        password:{
        type: String,
        required:true
    },
    role:{
        type:String,
        enum:["superadmin","admin","creator","player"],
        default:'player'
    },
    
},{timestamp:true});

module.exports = mongoose.model("User",userSchema);