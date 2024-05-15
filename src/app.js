const express = require("express");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path");
const app = express();
const hbs = require("hbs");
require("./db/conn")
const auth = require("./middleware/auth")

const Register = require("./models/registers")

const port = process.env.PORT || 3000;

const viewsPath = path.join(__dirname, "../templates/views");
const staticPath = path.join(__dirname, "../public");
const partialPath = path.join(__dirname, "../templates/partials");

console.log(staticPath)
// app.use(express.static(static_path));
app.use(express.static(staticPath));
app.use(cookieParser());
app.use(express.json());//for registration page
app.use(express.urlencoded({extended:false}));//for registration page
app.set("view engine", "hbs");
app.set("views", viewsPath); // Specify the views directory
hbs.registerPartials(partialPath)

// console.log(process.env.SECRET_KEY)


app.get("/", (req, res) =>{
    res.render("index")
});

app.get("navbar",auth, (req, res) =>{
    res.render({ user: req.user })
});

app.get("/OopsLogout", (req, res) =>{
    res.render("OopsLogout")
});

app.get("/dashboard", auth, (req, res) =>{
    // console.log(req.cookies.jwt);
    res.render("dashboard", { user: req.user })
    
});

app.get("/logout", auth, async(req, res) =>{
    try{
        // logout from current Single device 
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token !== req.token;
        })

        //Logout from all devices
        // req.user.tokens = [];

        //Clear Cookie
        res.clearCookie("jwt");

        console.log("logout successfull");
        await req.user.save();
        res.render("login");
    }catch(err){
        res.status(500).send(err);
    }
});

app.get("/register", (req, res) =>{
    res.render("register")
});

//Sending registration data to mongodb
app.post("/register", async(req, res) =>{
    try{
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if(password === confirmPassword){
            const registerEmployee = new Register({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                dob: req.body.dob,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            })
            console.log("the success part: " +registerEmployee);
            const token = await registerEmployee.generateAuthToken();
            console.log("the token part: " +token);

            //Expires token using cookie    
            res.cookie("jwt", token, {
                expires:new Date(Date.now() + 30000), //30000 = 30seconds
                httpOnly:true
            }); //cookies

           const registered = await registerEmployee.save()
           res.status(201).render("index")
        }else{
            res.send("Password are not matching")
        }
    }catch(err){
        res.status(400).send(err);
    }
});

app.get("/login", (req, res) =>{
    res.render("login")
});

// Login validation 
app.post("/login", async (req, res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        // console.log(`${email} and password is ${password}`)

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password, useremail.password); //checking hash passwords

        const token = await useremail.generateAuthToken();

        //Expires token using cookie    
        res.cookie("jwt", token, {
            expires:new Date(Date.now() + 600000), //30000 = 30seconds
            httpOnly:true
        });

        
        
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("Invalid login details")
        }
    }catch(err){
        res.status(400).send("Invalid login details");
    }
});

// formatting date-of-birth to display on dashboard
hbs.registerHelper('formatDate', (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
});

app.listen(port, ()=>{
    console.log(`Server is running at port no ${port}`);
})

