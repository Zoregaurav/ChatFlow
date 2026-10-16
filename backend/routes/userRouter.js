 // login , logout , signupt , profile
import express from "express";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import {login,signup,profile,logout,deleteAccount} from "../controllers/userController.js";
import unauthenticatedRateLimiter  from "../middlewares/unauthenticatedRateLimiter.js";
import authenticatedRateLimiter from "../middlewares/authenticatedRateLimiter.js";
import loadUserMiddleWare from "../middlewares/loadUserMiddleware.js";


const userRouter=express.Router();


userRouter.post("/login",unauthenticatedRateLimiter,login);
userRouter.post("/logout",authUserMiddleware,authenticatedRateLimiter,logout);
userRouter.post("/signup",unauthenticatedRateLimiter,signup);
userRouter.get("/profile",authUserMiddleware,authenticatedRateLimiter,loadUserMiddleWare,profile);
userRouter.delete("/delete",authUserMiddleware,authenticatedRateLimiter,loadUserMiddleWare,deleteAccount);
         


 export default userRouter;

