const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/mspRegistration")
.then(()=>{
    console.log("Connection is successfull")
}).catch((err)=>{
    console.log(err)
})
