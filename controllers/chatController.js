import Chat from "../model/chatSchema.js";
import chat from "../model/chatSchema.js";
import Message from "../model/messageSchema.js";

//getRecentChat,getSingleChat,createChat,deleteChat


//req.user=user ki information  hogi //last 20 chats muje fetch karni hain...

export const getRecentChat = async (req, res) => {

    try {
        const chats =await chat.find({ userId: req.user._id }).select("topic updatedAt").limit(20).select("message");
        res.status(200).json({
            message: "Your all recent chats",
            chats
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getSingleChat = async (req, res) => {
    try {
        const{chatId}=req.params;

       const chat= Chat.findOne({_id:chatId,userId:req.users._id});

       if(!chat){
        res.status(404).json({
            message:"Sorry data not found"
        })
       }
       res.status(200).json({
          chatId:chat._id,
          userId:chat.user,
          topic:chat.topic,
          usage:chat.usage
       })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const createChat = async (req, res) => {
    try {
       const {model}=req.body;
      //opus4.8,sol4.2,jkddndn->check 
       if(!model){
        return res.status(400),json({
            message:"Model name is missing"
        })
       }
     const chats=await Chat.create({
           userId:req.user._id,
           model,  
       })
       res.status(201).json({
         message:"Chat created successfully",
         chatId:chats._id,
         userId:req.user._id,
         model,
         topic:chats.topic,
         createdAt:chats.createdAt
       })
    }

    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const deleteChat = async (req, res) => {
    try {
        
        const {chatId}=req.params;

      const chat=await Chat.findOne({_id:chatId,userId:req.user._id});

        if(!chat){
           return res.status(403).json({
            message:"You are not allowed to do this"
           })
        };
        
          await Message.deleteMany({
          chatId:chat._id 
        })

        await Chat.deleteOne({
            _id:chatId
        })
 
        res.status(200).json({
          message:"Chat deleted successfully"
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}