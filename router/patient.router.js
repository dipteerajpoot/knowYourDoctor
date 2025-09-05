import express from "express";
import {body} from "express-validator";
import { SearchDoctor } from "../controller/docter.controller.js";
import {signUpPatient , verifyAccount,signInPatient,logOutPatient,createPatientProfile,updateProfile,fetchProfile } from "../controller/patient.controller.js";
import {auth} from "../middleware/auth.js";
import multer from "multer";
const upload = multer({dest:"public/patientProfile"});
const router = express.Router();




router.post("/signUp",
    body("name","name is required").notEmpty(),
        body("name", "Only Alphabets are allowed").isAlpha(),
        body("name","Name can only contain alphabets, space, underscore and hyphen").matches(/^[A-Za-z _-]/),
        body("email","email is required ").notEmpty(),
        body("email", "invalid email id").isEmail(),
        body("password", "password is required").notEmpty(),
        body("password","password is between 8 to 10 charctor").isLength({ min: 8, max: 10 }),
        body("role","role is required").isAlpha(),signUpPatient
    );

router.post("/verification", verifyAccount);
router.post("/signIn",signInPatient);
router.post("/signOut",auth,logOutPatient)  
router.patch("/createProfile",auth,upload.single("imageName"),createPatientProfile);
router.patch("/updateProfile",auth,upload.single("imageName"),updateProfile)
router.get("/fethcProfile",auth,fetchProfile);
router.get("/search",auth,SearchDoctor);    

export default router;  



