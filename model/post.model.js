import mongoose from "mongoose";
const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    postImage : {
        type:String,
    },
    postVideo:{
        type:String,
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    createDate:{
        type:Date,
        default:Date.now
    }

})
export const Post = mongoose.model("post",PostSchema);


