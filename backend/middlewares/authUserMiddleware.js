import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";


export const authUserMiddleware=async(req,res,next)=>{
     try{

        const {token}=req.cookies;

        //verify the token:
          if(!token){
         return res.status(401).json({
               message:"You need to login First"
          })
        }

        // yaha pe redis se jayada cost aati toh better hain after token verfiy ham check karegne redis ke andar....
         
        const payload=jwt.verify(token,process.env.JWT_SECRET);

        //redis ke block list mein token hua ,toh oos token ko block kar dena...
        // check whether token was revoked
        const blockedToken= await redisClient.get(
          `blocklist:${token}`
        )

        if(blockedToken){
          return res.status(401).json({
            message:"Please login again"
          });
        }

     //find user : ye kam main baad mein karta hu esko hataya...
      //  const existingUser=await User.findById(payload.id);

      //  if(!existingUser){
      //   return res.status(404).json({
      //        message:"User Doesn't Exist"
      //   })
      //  }

       //Attach authentication information:
       req.userId=payload.id;
       req.token=token;
       req.tokenPayload=payload;

       next();
     }catch(err){
       console.log(err);
       res.status(500).json({
        message:"Internal Server Error"
       })
     }
}


export default authUserMiddleware;
