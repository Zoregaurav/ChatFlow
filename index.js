import dotenv from "dotenv/config";
import express from "express";
import connectDB from "./config/data.js";
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/messageRouter.js";
import { login,logout,signup,profile } from "./controllers/userController.js";
import cookieParser from "cookie-parser";
import authUserMiddleware from "./middlewares/authUserMiddleware.js";
import chatRouter from "./routes/chatRouter.js";
import { connectRedis } from "./config/redis.js";


// dotenv.config();   //real case


const app = express();


// app.use("/",(req,res)=>{
//    res.json("Hello ji");
// })



app.use(express.json());



app.use("/chats",chatRouter);
app.use(cookieParser());




app.use("/user",userRouter);
app.use("/msg",messageRouter);
app.use("/chat",chatRouter);



  //http://strikes.in/user/login
  //http://strikes.in/user/logout
  //http://strikes.in/user/signup
  //http://strikes.in/user/profile


  //http://strikes.in/msg/read
  //http://strikes.in/msg/delete
  //http://strikes.in/msg/edit
  //http://strikes.in/msg/update


  //http://strikes.in/chat/getRecentChat
   //http://strikes.in/chat/232


//login,signup,logout,profile,user related

//chat api: 

//message banege api


//server connection:
const startServer = async()=>{
    try {
      await connectDB();
      await connectRedis();

     app.listen(process.env.PORT,()=>{
        console.log("server has started listening at port 3000");
     })
    } catch (err) {
       console.log(err);
    }
}

startServer();

// note:process.env->node.js feature 

//server start and server listen there is an difference

