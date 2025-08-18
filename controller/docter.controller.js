import { body, validationResult } from "express-validator";
import { User } from "../model/user.model.js"
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const doctorList = async (request, response, next) => {
    try {
        let doctors = await User.find({ role: "doctor" });
        doctors.forEach(doctor => {
            if (doctor.profile && doctor.profile.imageName) {
                doctor.profile.imageName = "http://localhost:3000/" + doctor.profile.imageName;
            }
        })
        return response.status(200).json({ message: "doctorList", doctors })

    } catch (error) {
        console.log(error);
        return response.status(500).json("Internel server error");
    }
}

export const SearchDoctor = async (request, response) => {
    try {
        const { name, location, disease, city } = request.query;
        let query = { role: "doctor" };
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (location)
            query.city = { $regex: location, $options: 'i' };
        if (disease) {
            query.disease = { $regex: disease, $options: 'i' };
        }
        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }
        const result = await User.find(query);

        if (!result)
            return response.status(200).json("No Any Doctor found")

       return response.status(200).json(result);
    }
    catch (error) {
        console.error("Search Error:", error);
        return response.status(500).json({ message: "Internal Server Error" });
    }
};

export const fetchProfile = async (request, response) => {
    try {
        let { doctorId } = request.body;
        let doctor = await User.findById({ _id: doctorId });
        doctor.profile.imageName = "http://localhost:3000/" + doctor.profile.imageName;
        return response.status(201).json({ doctor });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internel server error" });
    }
};

export const updateProfile = async (request, response, next) => {
    try {
        const { doctorId, role } = request.user;
        let doctor = await User.findOne({ _id: doctorId, role });
        if (!doctor) {
            return response.status(404).json({ error: "doctor not found" });
        }

        doctor.name = request.body.name ?? doctor.name;
        doctor.email = request.body.email ?? doctor.email;
        doctor.role = request.body.role ?? doctor.role;
        doctor.profile.imageName = request.file?.filename ?? doctor.profile.imageName;
        doctor.profile.address = request.body.address ?? doctor.profile.address;
        doctor.profile.phone = request.body.phone ?? doctor.profile.phone;
        doctor.profile.bio = request.body.bio ?? doctor.profile.imageName;
        doctor.doctorInfo.specialization = request.body.specialization ?? doctor.doctorInfo.specialization;
        doctor.doctorInfo.experience = request.body.experience ?? doctor.doctorInfo.experience;
        doctor.doctorInfo.education = request.body.education ?? doctor.doctorInfo.education;
        doctor.doctorInfo.location = request.body.location ?? doctor.doctorInfo.location;
        const availability = request.body.availability;
        if (availability && Array.isArray(availability)) {
            doctor.doctorInfo.availability = availability;
        }
        await doctor.save();
        return response.status(200).json({ message: "Profile updated added successfully" });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internal Server Error", error });
    }
};

export const createDocProfile = async (request, response, next) => {
    try {
        const { doctorId, role } = request.user;
        let doctor = await User.findOne({ _id: doctorId, role });
        if (!doctor) {
            return response.status(404).json({ error: " doctor not found || First signIn     the User" });
        }
        doctor.name = request.body.name ?? doctor.name;
        doctor.email = request.body.email ?? doctor.email;
        doctor.role = request.body.role ?? doctor.role;
        doctor.profile.imageName = request.file?.filename;
        doctor.profile.address = request.body.address;
        doctor.profile.phone = request.body.phone;
        doctor.profile.bio = request.body.bio;
        doctor.doctorInfo.specialization = request.body.specialization;
        doctor.doctorInfo.experience = request.body.experience;
        doctor.doctorInfo.education = request.body.education;
        doctor.doctorInfo.location = request.body.location;
        const availability = request.body.availability;
        if (availability && Array.isArray(availability)) {
            doctor.doctorInfo.availability = availability;
        }
        await doctor.save();
        return response.status(200).json({ message: "Profile Updated successfully" })
    } catch (error) {
        console.log(error)
        return response.status(500).json({ error: "Internal Server Error", error });
    }
}

export const logoutDoctor = async (request, response, next) => {
    try {
        console.log("clearcookie exicueted");

        response.clearCookie("token");
        return response.status(200).json({ message: "SignOut successfull" });
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internel Server Error", error });
    }
}

export const signInDoctor = async (request, response, next) => {
    try {
        let { email, password, role } = request.body;
        let user = await User.findOne({ email, role });
        if (!user || user.role !== "doctor")
            return response.status(401).json({ error: "Unauthorized User || User not found" });

        if (!user.doctorInfo.isVerified)
            return response.status(401).json({ error: "Please verify Your Account || Account is not verified" });

        let passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return response.status(401).json({ error: "Rong Password || Invalid User" });
        console.log(user);
        let token = generateToken(user.email, user._id, user.role);
        response.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });
        user.password = undefined;
        passwordMatch ? response.status(200).json({ message: "signIn SuccessFully", user },) : response.status(401).json({ error: "login Failed" })

    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internel Server Error", error });
    }
}

export const signUpDoctor = async (request, response, next) => {
    try {
        //  Validate doctor
        const errors = validationResult(request);
        if (!errors.isEmpty()){
            console.log(errors.array());
            return response.status(400).json({ error: "Bad request | Invalid Data", errorMessages: errors.array()});
        
        }
        let { name, email, password, role } = request.body;
        let saltkey = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, saltkey);
        await User.create({ name, email, password, role });
        await sendEmail(name, email);
        return response.status(201).json({ message: "SignIn Successfull | Please varify your account" });
    }
    catch (error) {
        console.log(error);
        return response.status(500).json({ error: "Internel sever Error", error });
    }

}

export const varifyAccount = async (request, response, next) => {
    try {
        let { email } = request.body;
        console.log("verify : ", email);
        let result = await User.updateOne({ email }, { $set: { "doctorInfo.isVerified": true } });
        console.log("MongoDB Update Result:", result);

        if (result.matchedCount === 0)
            return response.status(404).json({ error: "User not found" });
        if (result.modifiedCount === 0)
            return response.status(200).json({ message: "Already verified" });


        return response.status(201).json({ message: "verification completed" })
    }
    catch (err) {
        console.log(err)
        return response.status(500).json({ error: "Internal Server Error" });
    }

}

const sendEmail = (name, email) => {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        let mailOption = {
            from: process.env.EMAIL,
            to: email,
            subject: "Accounte Verification",
            html: `<h3>Dear ${name} </h3>
            <p>Welcome to know your Doctor. Please verify its you if not you dont accept the cookies.</p>
            <form method = "post" action = "http://localhost:3000/doctor/verification">
            <input type = "hidden" name = "email" value =" ${email}" />
            <button type="submit" style="background-color: blue; color:white; width:200px; border: none; border: 1px solid gray; border-radius:10px;">Verify</button>
            </form>
            <p>
            <h6>Thank You</h6>
            Know your Doctor .
            </p> 
            `
        };
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

const generateToken = (email, userid, role) => {
    let payload = ({ "emailId": email, "doctorId": userid, "role": role });
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });
}
