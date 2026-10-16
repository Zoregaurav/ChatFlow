import * as z from "zod";


//name,age,email,password
export const signupScehma=z.object({
    name:z.string()
    .trim()
    .min(3,"Minimum length name of should be 3")
    .max(30,"maximum length of name should be 30"),

    age:
    z.number()
    .min(10,"Minimum age should be 10")
    .max(100,"maximum age should be 100")
    .optional(),
    
    //" Rohit@gmail.com "
    email:z.preprocess(
       (value)=>typeof value=="string"?value.trim().toLowerCase():"",
       z.email("Email must be valid")
    ),

    password: 
     z.string()
     .min(8)
     .max(30)
     .regex(/[A-Z]/,"Your password should have atleast one captial letter")
     .regex(/[a-z]/,"Your password should have atleast one small letter")
     .regex(/[0-9]/,"Your password should have atleast one Number")
     .regex(/[~?.,<>{}`'#&-=+!@$^*]/,"")
})



export const loginSchema=z.object({    
    //" Rohit@gmail.com "
    email:z.preprocess(
       (value)=>typeof value=="string"?value.trim().toLowerCase():"",
       z.email("Email must be valid")
    ),

    password: 
     z.string()
     .min(8)
     .max(30)
     .regex(/[A-Z]/,"Your password should have atleast one captial letter")
     .regex(/[a-z]/,"Your password should have atleast one small letter")
     .regex(/[0-9]/,"Your password should have atleast one Number")
     .regex(/[~?.,<>{}`'#&-=+!@$^*]/,"")
})