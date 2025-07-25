import { request, response } from "express"
import { Post } from "../model/post.model.js"
import mongoose from "mongoose";
//creating the post only for doctor
export const createPost = async (request, response, next) => {
    try {
        const { doctorId, role } = request.user;
        if (role !== "doctor") {
            return response.status(403).json({ error: "Restriction : Only doctors are allow for post" });
        }
        const newPost = new Post({
            title: request.body.title,
            content: request.body.content,
            postImage: request.file?.filename,
            doctorId: doctorId
        })
        await newPost.save();
        return response.status(201).json({ message: "post added " })

    } catch (error) {
        console.log("PostErrorn", error);
        return response.status(500).json("Internel server Error")
    }

}

export const fetchAllPost = async (request, response, next) => {
    try {
        let post = await Post.find().populate("doctorId");
        post.postImage = "http://localhost:3000/" + post.postImage;
        return response.status(200).json({ message: "Posts :", post })

    } catch (error) {
        console.log("PostError", error);
        return response.status(500).json("Internel server Error")
    }
}

//getiny all post by doctor Id

export const getPostByDoctorId = async (request, response, next) => {
    try {
        let { id } = request.params;
        console.log(id);
        let posts = await Post.find({ doctorId: id });
        if (!posts || posts.length === 0)
            return response.status(404).json({ message: "No Posts available" });
        return response.status(200).json({ list: "posts", posts });
    } catch (error) {
        console.log("PostError", error);
        return response.status(500).json("Internel server Error")
    }
}

//getting posts for currunt doctor
export const getPostforCurruntDoctor = async (request, response, next) => {
    try {
        let { doctorId } = request.user;
        let posts = await Post.find({ doctorId });
        if (!posts || posts.length === 0)
            return response.status(404).json({ message: "No Posts available" });
        return response.status(200).json({ list: "posts", posts });
    } catch (error) {
        console.log("PostError", error);
        return response.status(500).json("Internel server Error")
    }
}

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
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: req.body.title,
                    content: req.body.content,
                    postImage: req.body.postImage,
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json({ message: "Post updated", updatedPost });
    } catch (error) {
        console.error("PostError", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deletePost = async (request, response, next) => {
    try {
        const { id } = request.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: "Invalid Post ID" });
        }
        let result = await Post.findByIdAndDelete(id);
        // let result = await Post.deleteOne({ _id: id });
        if (result.deletedCount === 0)
            return response.status(401).json({ message: "post not deleted" });

        return response.status(200).json({ message: "post deleted" });
    } catch (error) {
        console.log("PostError", error);
        return response.status(500).json("Internel server Error")
    }
}

