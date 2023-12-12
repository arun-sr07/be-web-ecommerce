const User=require('../models/userModel')
const jwt=require("jsonwebtoken")
const asyncHandler=require("express-async-handler")

const authMiddleware=asyncHandler(async(req,res,next)=>{
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token=req.headers.authorization.split(" ")[1];
        try{
            if(token){
                const decoded=jwt.verify(token,process.env.JWT_SECRET);
                const user=await User.findById(decoded?.id);
                req.user=user
                next()
                console.log(decoded);

            }}
            catch(error){
                throw new Error("Unauthorised ");
            }


        }
        else{
            throw new Error("There is no token attached to header");

        }
 
});
const isAdmin=asyncHandler(async(req,res,next)=>{
    const{email}=req.user
    const adminUser=await User.findOne({email});
    if(adminUser.role!=="admin"){
        throw new Error("your not admin")

    }
    else{
        next();
    }
});
module.exports={authMiddleware,isAdmin};