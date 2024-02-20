require('dotenv').config()
const express=require('express')
const app=express()
const port=3000
const path=require('path')
const userRoute=require("./router/userRouter")
const adminRoute=require('./router/adminRoute')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const flash = require('express-flash');
const session=require('express-session')
const crypto=require('crypto')
const noCache= require('nocache')
const bcrypt = require('bcrypt');


app.use(noCache());
app.use(session({
    secret:crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true,
}))
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine','ejs')
app.set('views','./views/user')






mongoose.connect('mongodb+srv://ElegantStyle:S123h343i@elegantstyle.svxccyn.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.log("Failed to connect to MongoDB:", error);
});


app.use(express.static(path.join(__dirname,'public')))
app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('*',(req,res)=>{
    res.render('404')
})




app.listen(port,()=>{
    console.log("server is running on localhost");
})