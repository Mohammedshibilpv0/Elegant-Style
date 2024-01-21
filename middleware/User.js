const session = require('express-session')
const Users=require('../model/User')
const Cart=require('../model/cartSchema')


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

const cartcount= async (req,res,next)=>{
  try{
    const userid=req.session.user_id
    const count=await Cart.findOne({userid:userid}).count
    if(count>0){
      next()
    }else{
      res.redirect('/usercart')
    }
  }catch(err){
    console.log(err);
  }
}

module.exports={
    islogin,
    notlogged,
    isBlock,
    cartcount
}