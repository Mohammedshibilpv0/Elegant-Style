require('dotenv').config()
const express=require('express')
const app=express()
const port=process.env.port||4000
const path=require('path')
const userRoute=require("./router/userRouter")
const adminRoute=require('./router/adminRoute')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const flash = require('express-flash');
const session=require('express-session')
const crypto=require('crypto')
const noCache= require('nocache')
app.use(noCache());
const bcrypt = require('bcrypt');


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






mongoose.connect('mongodb://127.0.0.1:27017/ElegantStyle').then(()=>{
    console.log("Mongodb connected");
}).catch(()=>{
    console.log("Failed to connect");
})


app.use(express.static(path.join(__dirname,'public')))
app.use('/',userRoute)
app.use('/admin',adminRoute)
app.use('*',(req,res)=>{
    res.render('404')
})




app.listen(port,()=>{
    console.log("server is running on localhost");
})