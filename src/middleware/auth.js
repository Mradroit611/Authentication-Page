const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next) =>{
    try{
        const token = req.cookies.jwt;

        const verifyUser = jwt.verify(token, "YOURSECRETKEYGOESSDFFSDFFGDSDFSHERE");
        console.log(verifyUser);

        const user = await Register.findOne({_id:verifyUser._id}); //Getting data of user from mongo
        console.log(user);
        console.log(user.firstName)

        req.token = token; //getting token value after login
        req.user = user;

        next();
    }catch(err){
            res.status(401).render("OopsLogout");
    }
}

module.exports = auth;