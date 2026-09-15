import { redisClient } from "../config/redis.js";


export const unauthenticatedRateLimiter=async(req,res,next)=>{
    try{
        //ip address track:key:ip address,value:0,ttl=60;
         const key=`rate-limit:ip:${req.ip}`;

         const requestCount=await redisClient.incr(key); //ye line set bhi karega and key ko 1 bhi karega
   
         if(requestCount==1){
            await redisClient.expire(key,60);
         }
            if(requestCount>10){
                const remainingTime=await redisClient.ttl(key);

                return res.status(429).json({
                    Message:`Too many request.Try again after ${remainingTime}`
                })
         }
         next();
    }catch(error){
      console.log("Unauthenticated rate limiter error:",error);
      //If redis fails,don't stop the entire application
      next();
    }
}


export default unauthenticatedRateLimiter;
