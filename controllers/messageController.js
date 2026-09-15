import Chat from "../model/chatSchema.js";
import messageRouter from "../routes/messageRouter.js";
import Message from "../model/messageSchema.js"
import mongoose from "mongoose";
// import openRouter from "../config/gemini.js";
import { generateAIResponse } from "../services/geminiService.js";
import { buildMessagesForAI } from "../utils/chatContext.js";
import {addUserTokenUsage } from "../utils/userUsage.js";
import {addChatTokenUsage} from "../utils/tokenUsage.js";
import {updateSummaryIfNeeded} from "../services/summaryService.js";
import { redisClient } from "../config/redis.js";

//getMsg,  sendMsg

// flow of msg--->
// Frontend->Backend->DB stored->LLM 
// LLM->Backend->db->frontend


export const getMessage = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    const messages = await Message.find({
      chatId: chatId
    }).sort({ createdAt: 1 });  //Ascending order


    res.status(200).json({
      messages: "Your all messages are here",
      msg: messages
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error"
    })
  }
}



export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, model } = req.body;

    // 1. Validate message content
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Message content is required"
      });
    }

    //redis ke vajase:
    // await resetUsageIfNeeded(req.user);
    // if (hasTokenLimitReached(req.user)) {
    //   return res.json({
    //     message: "Token reached.pleased try after some time.",
    //     usage: req.user.usage,
    //   });
    // }

    //yaha pe redis bhaiya ko lana padega:
      
    let chat;
    // 2. Existing chat case
    if (chatId) {
      // Check valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({
          message: "Invalid chat id"
        });
      }

      chat = await Chat.findOne({
        _id: chatId,
        userId: req.user._id
      });

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found"
        });
      }
    }

    // 3. New chat case
    else {
      if (!model) {
        return res.status(400).json({
          message: "Model is required for new chat"
        });
      }

      chat = await Chat.create({
        userId: req.user._id,
        model,
        topic: content.trim().slice(0, 40),

      });
    }


    // 5. Dummy AI reply for now
    // Later we will replace this with OpenRouter response
    //Message prepare:History store rakhni pedegi,DB,
    //summary create karni padegi..... 

    //oldMessages:jinki abhi tak summary create nahi hui hain..

    const oldMessages = await Message.find({
      chatId: chat._id,
    })
      .sort({ createdAt: 1 })
      .skip(chat.summarizedTillMessageNumber);


    const messageForAI = await buildMessagesForAI({
      chat,
      oldMessages,
      currentMessage: content.trim(),
    });

    const { aiReply, usage } = await generateAIResponse({
      model: chat.model,
      messages: messageForAI
    });


    const userMessage = await Message.create({
      chatId: chat._id,
      userId: req.user._id,
      role: "user",
      content: content.trim()
    });


    // 6. Save assistant message
    const assistantMessage = await Message.create({
      chatId: chat._id,
      userId: req.user._id,
      role: "assistant",
      content: aiReply,
      usage,
    });


    // 7. Update chat metadata
    chat.messageCount += 2;

    // If topic is still default, update it from first message
    if (chat.topic === "New Chat") {
      chat.topic = content.trim().slice(0, 40);
    }

    await addChatTokenUsage(chat,usage);
    await addUserTokenUsage(req.user, usage.totalTokens);


    //redis ke andar information ko daalna padega..
    
    const tokenUsed = await redisClient.incrBy(
    req.tokenUsageKey,
    usage.totalTokens
  );

 if(tokenUsed === usage.totalTokens) {
    await redisClient.expire(
        req.tokenUsageKey,
        Number(process.env.TOKEN_WINDOW_SECONDS)
    );
 }


    // 8. Send response
    res.status(201).json({
      message:"Message sent successfully",
      chatId:chat._id,
      reply:aiReply,
      usage,
      tokenUsed,
      tokenLimit:Number(process.env.TOKEN_LIMIT),
      userMessage,
      assistantMessage
    });

     updateSummaryIfNeeded(chat._id).catch((err)=>{
      console.log("Summary updated failed",err.message);
    });

  } catch (err) {
    console.log("sendMessage error:",err.message);
    res.status(500).json({
      message: "Something went wrong"
    });
  }
};
















// flow

// USER opens Chat C123
//         │
//         ▼
// GET /C123
//         │
//         ▼
// req.params.chatId
//         │
//         ▼
// "C123"
//         │
//         │
//         ├───────────────┐
//         ▼               ▼
// req.user._id        chatId
//    "Gaurav"          "C123"
//         │               │
//         └───────┬───────┘
//                 ▼
//         Chat.findOne({
//             _id: C123,
//             userId: Gaurav
//         })
//                 │
//           ┌─────┴─────┐
//           │           │
//          NO          YES
//           │           │
//           ▼           ▼
//          404     Message.find({
//                     chatId: C123
//                   })
//                        │
//                        ▼
//                  sort by createdAt
//                     ascending
//                        │
//                        ▼
//                  Send messages
//                     to frontend

