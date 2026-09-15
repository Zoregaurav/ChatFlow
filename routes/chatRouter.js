import express from "express";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import { getRecentChat,createChat,getSingleChat,deleteChat } from "../controllers/chatController.js";
import authenticatedRateLimiter from "../middlewares/authenticatedRateLimiter.js";
import loadUserMiddleWare from "../middlewares/loadUserMiddleware.js";


//getRecentChat:top 20,getSingleChat,createChat,deleteChat

 
const chatRouter=express.Router();

chatRouter.use(authUserMiddleware);
chatRouter.use(authenticatedRateLimiter);
chatRouter.use(loadUserMiddleWare);


chatRouter.post("/createChat",createChat);
chatRouter.get("/getRecentChat",getRecentChat);
chatRouter.get("/:chatId",getSingleChat);
chatRouter.delete("/:chatId",deleteChat);


export default chatRouter;

 
