import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { signupScehma,loginSchema } from "../validators/userValidators.js";
import Chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";
import { redisClient } from "../config/redis.js";


//login
//logout
//profile


const createToken=(id,email)=>{
  if(!process.env.JWT_SECRET){
  throw new Error("JWT secret key is missing");
}
   const token=jwt.sign({id,email},process.env.JWT_SECRET,{expiresIn:"1h"});
   return token;
} 


const cookiesOption={
   httpOnly:true,
   secure:false,
   maxAge:60*60*1000
}

export const signup=async(req,res)=>{
       
      try{
        //validate all this data:
        
    const result= signupScehma.safeParse(req.body);

      if(!result.success){
          return res.status(400).json({
            message:result.error.issues[0].message
          })
       }
      
        const {name,age,email,password}=result.data;

        const user=await User.findOne({email});
        
        if(user){
          return res.status(400).json({
            message:"Email Id  already exists"
          })
        }
        const hashPassword=await bcrypt.hash(password,12);

        const userCreated=await User.create({
          name,
          age,
          email,
          password:hashPassword
        });
          
        //token create karna padata hain...
        //_id,email
        const token=createToken(userCreated._id,email);

        res.cookie("token",token,cookiesOption);

        res.status(201).json({
          message:"Account created successfully",
          name,
          age,
          email,
        })

      }catch(err){
        console.log(err);
         res.status(500).json({
          message:"Internal server error"
        })
      }
}


export const login=async (req,res)=>{
   try{

      const result=loginSchema.safeParse(req.body);


         if(!result.success){
          return res.status(400).json({
            message:result.error.issues[0].message
          })
         }
        const {email,password}=result.data;

      //verify the password:
      const existingUser=await User.findOne({email});

      if(!existingUser){
        return res.status(401).json({message:"Invalid Credentials"});
      }

      //match the passsword:
     const isMatch=await bcrypt.compare(password,existingUser.password);

     if(!isMatch){
      return res.status(400).json({message:"Invalid Credentials"});
     }

      // Create JWT
     const token=createToken(existingUser._id,email);

      // Store token in cookie
     res.cookie("token",token,cookiesOption);
     
    //  Send response
     res.status(200).json({message:"Login Successfully",
      name:existingUser.name,
      age:existingUser.age,
      email:existingUser.email,
      usage:existingUser.usage
     });

   }
   catch(err){
     console.log(err);
     res.json({message:"Intenal server error"}); 
   }
  
}

 

export const logout=async (req,res)=>{
      //logout

      try{
        
        if(req.token){

          const token=req.token;
          const payload=req.tokenPayload
  

          //Logic:
          //TTL nikalna padega....
          //ttl=payload Time-currentTime

          const currentTime=Math.floor(Date.now()/1000);
          const remainingTime=payload.exp-currentTime;

          if(remainingTime>0){
            await redisClient.set(
              `blocklist:${token}`,
               "blocked",
               {
                EX:remainingTime
               }
            );
          }
        }
         res.clearCookie("token",{
         httpOnly:true,
         secure:false
      })

      res.status(200).json({
        message:"User Logged out Successfully"
      })

      } catch(err){
          return res.status(500).json({
            message:"Internal Server Error"
          });
         
}

}



export const profile=async(req,res)=>{
   try{
     //profile ki info send karo
     //db ke andar call karni padegi
      res.status(200).json({
        name:req.user.name,
        age:req.user.age,
        usage:req.user.usage,
        email:req.user.email
      })
   } catch(err){
      console.log(err);
      res.json({
        message:"Internal server error"
      })
   }
}


export const deleteAccount=async(req,res)=>{
     try{
       //find all the chatId which belong to user

       //delete all the message which belongs to the chatId:Message delete
       //Delete all the chatId which belongs to this user:Delete wo chatId user belongs
       //Delete user profile:is user by it's ID
      
       const userId=req.user._id;

       await Message.deleteMany({
         userId
       });

       await Chat.deleteMany({
         userId
       });

       await User.deleteOne({
          _id:userId
       });

       res.clearCookie("token",{
        httpOnly:true,
        secure:false
       });
     
       res.status(200).json({
        message:"Account deleted successfully"
       })

     }catch(err){
      console.log(err);
      res.status(500).json({
        message:"Internal Server Error"
      })
     }
}