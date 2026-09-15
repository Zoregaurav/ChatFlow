import mongoose, { mongo } from "mongoose";
//validate:rohit@gmail.com

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30
    },
    age:{
        type:Number,
        min:10,
        max:100
    },

    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },

    //No need to store this token usage in DB 
    usage:{
     resetAt:{
        type:Date,
        default:()=>new Date(Date.now()+5*60*60*1000)
     },
     totalTokenUsed:{
        type:Number,
        default:0
     }
    }
},{timestamps:true});

const User=mongoose.model("User",userSchema);
export default User;