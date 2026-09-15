import { redisClient } from "../config/redis.js";


export const authenticatedRateLimiter=async(req,res,next)=>{
    try{
        const userId=req.userId;
         const key=`rate-limit:user:${userId}`;
            //  rate-limit:user:123
            //  rate-limit:user:456
            //  rate-limit:user:789

           // This stores the number returned by Redis.
         const requestCount=await redisClient.incr(key); //ye line set bhi karega and key ko 1 bhi karega .
         // rate-limit:user:123 = 6
         if(requestCount===1){
            await redisClient.expire(key,60);
         }
            if(requestCount>20){
                const remainingTime=await redisClient.ttl(key);//It tells Redis how many seconds remain before the key expires.

                return res.status(429).json({
                    Message:`Too many request.Try again after ${remainingTime}`
                })
         }
         next();
    }catch(error){
      console.log("Authenticated rate limiter error:",error);
      //If redis fails,don't stop the entire application
      next();
    }
}


export default authenticatedRateLimiter;


