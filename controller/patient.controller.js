import { validationResult } from "express-validator";
import { user } from "../model/user.model.js"
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
dotenv.config();

export const signUpPatient = async (request, response, next) => {
    try {
        //  Validate doctor
        const errors = validationResult(request);
        if (!errors.isEmpty())
            return response.status(400).json({ error: "Bad request | Invalid Data", errorMessages: errors.array() });

        let { name, email, password, role } = request.body;
        let saltkey = await bcrypt.genSalt(10);
        password = bcrypt.hashSync(password, saltkey);
        await user.create({ name, email, password, role });
        await sendEmail(name , email);
        return response.status(201).json({ message: "SignIn Successfull | Please varify your account" });
    }
    catch (err) {
        console.log(err);
        return response.status(500).json({ error: "Internel sever Error", err });
    }

}

export const verifyAccount =async(request , response, next)=>{
try{
let {email} = request.body;
    console.log("verify : ",email);
     let result = await user.updateOne({email},{$set :{"patientInfo.isVerified":true}});
         console.log("MongoDB Update Result:", result);
         
         if (result.matchedCount === 0) 
      return response.status(404).json({ error: "User not found" });
        if (result.modifiedCount === 0) 
      return response.status(200).json({ message: "Already verified" });


     return response.status(201).json({message:"verification completed"})
}
 catch(err){
     return response.status(500).json({error: "Internal Server Error"});
   }
 
}

const sendEmail = (name, email) =>{
    return new Promise((resolve,reject) =>{
        let transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PASSWORD
            }
        })

        let mailOption = {
            from : process.env.EMAIL,
            to:email, 
            subject:"Accounte Verification",
            html:`<h3>Dear ${name} </h3>
            <p>Welcome to know your Doctor. Please verify its you if not you dont accept the cookies.</p>
            <form method = "post" action = "http://localhost:3000/patient/verification">
            <input type = "hidden" name = "email" value =" ${email}" />
            <button type="submit" style="background-color: blue; color:white; width:200px; border: none; border: 1px solid gray; border-radius:10px;">Verify</button>
            </form>
            <p>
            <h6>Th                                                                          ank You</h6>
            Know your Doctor .
            </p> 
            `
        };
        transporter.sendMail(mailOption,function(error,info){
            if(error){
                reject(error);
            }
            else{
                resolve();
            }
        });
    });
}