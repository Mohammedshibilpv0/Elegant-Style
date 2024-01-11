const session = require('express-session')
const Users=require('../model/User')



const islogin=(req,res,next)=>{
    if(!req.session.user){

      next()
    }else{
      res.redirect('/')
    }
}
const notlogged=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

const isBlock= async (req,res,next)=>{
  const check= await Users.findOne({Email:req.session.email})

       if(req.session.user&&check.Status=="blocked"){
        req.session.user=null,
        req.session.Email=null
        req.session.user_id=null
      res.redirect('/')
       }else{
        next()
       }
}

module.exports={
    islogin,
    notlogged,
    isBlock,
}