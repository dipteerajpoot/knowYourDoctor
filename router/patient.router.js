import express from "express";
import {body} from "express-validator";
import {signUpPatient , verifyAccount,signInPatient,logOutPatient,createPatientProfile,updateImage} from "../controller/patient.controller.js";
import {auth} from "../middleware/auth.js";
import multer from "multer";
const upload = multer({dest:"public/patientProfile"});
const router = express.Router();

router.post("/signUpPatient",
    body("name","name is required").notEmpty(),
        body("name", "Only Alphabets are allowed").isAlpha(),
        body("email","email is required ").notEmpty(),
        body("email", "invalid email id").isEmail(),
        body("password", "password is required").notEmpty(),
        body("password","password is between 8 to 10 charctor").isLength({ min: 8, max: 10 }),
        body("role","role is required").isAlpha(),signUpPatient
    );

router.post("/verification", verifyAccount);
router.post("/signInPatient",signInPatient);
router.post("/logoutPatient",auth,logOutPatient)
router.patch("/createProfile",auth,upload.single("imageName"),createPatientProfile);
router.patch("/updateImage",auth,upload.single("imageName"),updateImage)

export default router;  



