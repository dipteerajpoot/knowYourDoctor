import express from "express";
import { createPost,fetchAllPost,getPostByDoctorId ,getPostforCurruntDoctor,updatePost,deletePost} from "../controller/post.controll.js";
import {auth} from "../middleware/auth.js";
import multer from "multer";
const upload = multer({dest:"public/posts"});
// import  roleChek, { doctorOnly } from "../middleware/rolecheck.js";

const router = express.Router();

router.post("/createPost",auth,upload.single("postImage"),createPost);
router.get("/fetchPost",auth,fetchAllPost);
router.get("/getPostById/:id",auth,getPostByDoctorId);
router.get("/getposts",auth,getPostforCurruntDoctor);
router.patch("/updatePost/:id",auth,upload.single("postImage"),updatePost);
router.delete("/deletePost/:id",auth,deletePost);

export default router;