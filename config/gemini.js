// import { OpenRouter } from "@openrouter/sdk";
import { GoogleGenAI } from '@google/genai';


// if(!process.env.OPENROUTER_API_KEY){
//      throw new Error("OPENROUTER_API_KEY is missing!");
// }

//Gemini api:
if(!process.env.GEMINI_API_KEY){
     throw new Error("GEMINI_API_KEY is missing!");
}

// const openRouter=new OpenRouter({
//     apiKey: process.env.OPENROUTER_API_KEY,
// })


// Gemini:
const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});


// export default openRouter;

export default ai;


