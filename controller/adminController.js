const Users=require('../model/User')

const home=(req,res)=>{
    res.render('home')
}
const login=(req,res)=>{
    const errmsg = req.flash("err");
    res.render('adminlogin',{errmsg})
}


//verifyAdmin

const verifyAdmin=(req,res)=>{
    const email=process.env.adminEmail
    const password=process.env.adminPassword
    const name=process.env.adminName
    if(email==req.body.email&&password==req.body.password){
        req.session.admin=name
        res.redirect('/admin')
    }else{
        const errormsg = "Admin not found";
        req.flash("err", errormsg);
        res.redirect('/admin')
    }

}

const logout=(req,res)=>{
    req.session.admin=null
    res.redirect('/admin')

}

const allusers= async (req,res)=>{
const userData= await Users.find()
res.render('allusers',{userData})
}



module.exports={
    home,
    login,
    verifyAdmin,
    logout,
    allusers
}