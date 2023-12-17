
const verify=(req,res,next)=>{

    if(req.session.admin){
        next()
    }else{
        res.redirect('/admin/login')
    }
}

const isLogin=(req,res,next)=>{

    if(!req.session.admin){
        next()
    }else{
        res.redirect('/admin')
    }
}


module.exports={
    verify,
    isLogin
}