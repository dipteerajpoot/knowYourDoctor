import { signUpDoctor , varifyAccount } from "../controller/docter.controller.js";
import {body }from "express-validator";
import express from "express";

const router = express.Router();

router.post("/signUpDoctor",body("name","name is required").notEmpty(),
    body("name", "Only Alphabets are allowed").isAlpha(),
    body("email","email is required ").notEmpty(),
    body("email", "invalid email id").isEmail(),
    body("password", "password is required").notEmpty(),
    body("password","password is between 8 to 10 charctor").isLength({ min: 8, max: 10 }),
    body("role","role is required").isAlpha(),
 signUpDoctor 
)

router.post("/verification" , varifyAccount);
export default router;
