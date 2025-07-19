import mongoose, { Schema, version } from "mongoose";
const UserSchema = new mongoose.Schema({
    //we have to module use & doctor and both are using same schema 
    name: {
        type: String,
        required: true,
        trim: true,
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
        experience: Number,
        education: String,
        certificates: [
            {
                name: String,
                description: String,
                issuedBy: String,
                year: Number,
            }
        ],
        availability: String,
        location: String,
        languages: {
            type: [String],
            default: [],
        },
        isVerified: {
            type: Boolean,
            default: false
        },

    },
    patientInfo: {  
        age: Number,
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        isVerified: {
            type: Boolean,
            default: false
        },
    },
},
    { timestamps: true }, { versionKey: false }
);

export const user = mongoose.model("user",UserSchema);