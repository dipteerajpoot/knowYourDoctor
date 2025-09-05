import { request, response } from "express"
import { Post } from "../model/post.model.js"
import mongoose from "mongoose";
//creating the post only for doctor
export const createPost = async (req, res, next) => {
    try {
        const { doctorId, role } = req.user;

        if (role !== "doctor") {
            return res.status(403).json({ error: "Only doctors are allowed to post" });
        }

        const postImage = req.files?.postImage?.[0]?.filename || null;
        const postVideo = req.files?.postVideo?.[0]?.filename || null;

        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            postImage,
            postVideo,
            doctorId
        });

        await newPost.save();

        return res.status(201).json({ message: "Post added successfully", post: newPost });

    } catch (error) {
        console.log("PostError:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const fetchAllPost = async (req, res, next) => {
    try {
        let posts = await Post.find().populate("doctorId");

        const updatedPosts = posts.map(post => ({
            ...post._doc, 
            postImage: post.postImage ? `http://localhost:3000/${post.postImage}` : null,
            postVideo: post.postVideo ? `http://localhost:3000/${post.postVideo}` : null
        }));

        return res.status(200).json({ message: "Posts fetched successfully", posts: updatedPosts });

    } catch (error) {
        console.log("PostError", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



// export const getPostByDoctorId = async (request, response, next) => {
//     try {
//         let { doctorId } = request.user;
//         console.log(doctorId);
//         let posts = await Post.find({ doctorId});
//         if (!posts || posts.length === 0)
//             return response.status(404).json({ message: "No Posts available" });
//         posts=poasts.map(post =>{
//             return{
//    posts.postImage = "http://localhost:3000"+Post.postImage;
//         posts.postVidio = "http://localhost:3000"+Post.postVideo;
                
//             }
//         })
     
//         return response.status(200).json({ list: "posts", posts });
//     } catch (error) {
//         console.log("PostError", error);
//         return response.status(500).json("Internel server Error")
//     }
// }


//getting posts for currunt doctor
export const getPostforCurruntDoctor = async (req, res, next) => {
    try {
        const { doctorId } = req.user;
        let posts = await Post.find({ doctorId }).populate("doctorId");
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: "No Posts available" });
        }
        const updatedPosts = posts.map(post => ({
            ...post._doc, 
            postImage: post.postImage ? `http://localhost:3000/posts/${post.postImage}` : null,
            postVideo: post.postVideo ? `http://localhost:3000/posts/${post.postVideo}` : null,
        }));
        return res.status(200).json({ message: "Posts fetched successfully", posts: updatedPosts });
    } catch (error) {
        console.log("PostError", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


//update post
// export const updatePost = async(request,response,next) =>{
//     try {
//         const {id} = request.params;
//         let posts = await Post.findById(id);
//         if(!posts || posts.length === 0)
//             return response.status(404).json({message:"No Posts available"});

//         posts.title = request.body.title??posts.title;
//         posts.content = request.body.content ?? posts.content;
//         posts.postImage = request.body.postImage ?? posts.postImage;
//         await posts.save();
//         return response.status(200).json({list:"posts",posts});
//     } catch (error) { 
//          console.log("PostError",error);
//         return response.status(500).json("Internel server Error")
//     }
// }

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        post.title = req.body.title ?? post.title;
        post.content = req.body.content ?? post.content;
        post.postImage = req.files?.postImage?.[0]?.filename || post.postImage;
        post.postVideo = req.files?.postVideo?.[0]?.filename || post.postVideo;

        await post.save();

        res.status(200).json({
            message: "Post updated",
            post: {
                ...post._doc,
                postImage: post.postImage ? `http://localhost:3000/${post.postImage}` : null,
                postVideo: post.postVideo ? `http://localhost:3000/${post.postVideo}` : null,
            }
        });

    } catch (error) {
        console.error("PostError", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }
        const result = await Post.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: "Post not found or already deleted" });
        }
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("PostError", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


