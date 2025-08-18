import mongoose, { Schema, version } from "mongoose";
const UserSchema = new mongoose.Schema({
    //we have two module user & doctor and both are using same schema 
    name: {
        type: String, 
        required: true,
        trim: true,
        match:/^[A-Za-z _-]+$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["doctor", "patient", "admin"],
        default: "patient",
    },
    profile: {
        imageName: String,
        address: String,
        phone: String,
        bio: {
            type: String,
            maxlength: 1000,
        },
    },

    //only for Doctor---------------------
    doctorInfo: {
        specialization: String,
        experience: String,
        education: String,
        certificates: [
            {
                name: String,
                description: String,
                issuedBy : String,
                year: Number,
            }
        ],
        availability: [
            {
                day: String,
                from: String,
                to: String
            }
        ],  
        location: String,
        isVerified: {
            type: Boolean,
            default: false
        },
    },
    patientInfo: {
        age: String,
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        isVerified: {
            type: Boolean,
            default: false
        },
    },
    postId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }]

},
    {timestamps: true }, { versionKey: false }
);

export const User = mongoose.model("user", UserSchema);