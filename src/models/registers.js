const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
require('dotenv').config();
const jwt = require("jsonwebtoken")
const employeeSchema = new mongoose.Schema({
    firstName: {
        type:String,
        required:true
    },
    lastName: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    gender: {
        type:String,
        required:true
    },
    phone: {
        type:Number,
        required:true,
        unique:true
    },
    dob: {
        type:Date,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    confirmPassword: {
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

// Generating tokens 
employeeSchema.methods.generateAuthToken = async function(){
    try{
        // const token = jwt.sign({_id:this._id}, process.env.SECRET_KEY); 
        const token = jwt.sign({_id:this._id}, "YOURSECRETKEYGOESSDFFSDFFGDSDFSHERE"); 
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return(token);

    }catch(error){
        console.error("Error generating token:", error);
        throw error; 
    }
}

// Hashing the password before save to mongodb 
employeeSchema.pre("save", async function(next){
    if(this.isModified("password")){
        // const passwordHash = await bcrypt.hash(password, 10);
        console.log(`The current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`The current password is ${this.password}`);

        // this.confirmPassword = undefined;
        this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
    }
    next();
})

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;