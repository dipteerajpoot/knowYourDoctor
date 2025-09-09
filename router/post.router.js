import express from "express";
import {getPostByDoctorId, createPost,fetchAllPost,getPostforCurruntDoctor,updatePost,deletePost} from "../controller/post.controll.js";
import {auth} from "../middleware/auth.js";
import multer from "multer";
const upload = multer({dest:"public/posts"});
// import  roleChek, { doctorOnly } from "../middleware/rolecheck.js";

const router = express.Router();

router.post("/", auth, upload.fields([
    { name: "postImage", maxCount: 1 },
    { name: "postVideo", maxCount: 1 }]), createPost);

router.get("/",auth,fetchAllPost);
router.get("/get/:id",auth,getPostByDoctorId);
router.get("/getposts",auth,getPostforCurruntDoctor);
router.patch("/updatePost/:id",auth,upload.single("postMedia"),updatePost);
router.delete("/deletePost/:id",auth,deletePost);

export default router;