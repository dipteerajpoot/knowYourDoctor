    import { validationResult } from "express-validator";
    import { User } from "../model/user.model.js"
    import dotenv from "dotenv";
    import bcrypt from "bcryptjs";
    import nodemailer from "nodemailer";
    import jwt from "jsonwebtoken";
    dotenv.config();

    export const fetchProfile = async (request, response) => {
        try {
            let { patientId } = request.user;
            let patient = await User.findById({ _id: patientId });
            patient.profile.imageName = "http://localhost:3000/" + patient.profile.imageName;
            return response.status(201).json({ patient });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: "Internel server error" });
        }
    }


    export const updateProfile = async (request, response, next) => {
        try {
            const { patientId, role } = request.user;
            let patient = await User.findOne({ _id: patientId, role });
            if (!patient) {
                return response.status(404).json({ error: "Patient not found" });
            }
            patient.name = request.body.name ?? patient.name;
            patient.email = request.body.email ?? patient.email;
            patient.role = request.body.role ?? patient.role;
            patient.profile.imageName = request.file?.filename ?? patient.profile.imageName;
            patient.profile.address = request.body.address ?? patient.profile.address;
            patient.profile.phone = request.body.phone ?? patient.profile.phone;
            patient.profile.bio = request.body.bio ?? patient.profile.bio;
            patient.patientInfo.age = request.body.age ?? patient.patientInfo.age;
            patient.patientInfo.gender = request.body.gender ?? patient.patientInfo.gender;
            await patient.save();
            
            return response.status(200).json({ message: "Profile updated added successfully" });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: "Internal Server Error", error });
        }
    }


    export const createPatientProfile = async (request, response, next) => {
        try {
            const { patientId, role } = request.user;

            let patient = await User.findOne({ _id: patientId, role });
            if (!patient) {
                return response.status(404).json({ error: "Patient not found" });
            }
            patient.name = request.body.name ?? patient.name;
            patient.email = request.body.email ?? patient.email;
            patient.role = request.body.role ?? patient.role;
            patient.profile.imageName = request.file?.filename;
            patient.profile.address = request.body.address;
            patient.profile.phone = request.body.phone;
            patient.profile.bio = request.body.bio;
            patient.patientInfo.age = request.body.age;
            patient.patientInfo.gender = request.body.gender;
            await patient.save();
            return response.status(200).json({ message: "Profile updated added successfully" });
        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: "Internal Server Error", error });
        }
    }


    export const logOutPatient = (request, response, next) => {
        try {
            response.clearCookie("token");
            return response.status(200).json({ message: "Lngout succesfully" })
        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: "Internel server error ", error });
        }
    }

    export const signInPatient = async (request, response, next) => {
        try {
            let { email, password, role } = request.body;
            let patient = await User.findOne({ email, role });
            if (!patient || patient.role !== "patient")
                return response.status(401).json({ error: "Unauthorized user || user not found" });

            if (!patient.patientInfo.isVerified)
                return response.status(401).json({ error: "Please Verify your account || Account is not verified" });

            let isMatch = await bcrypt.compare(password, patient.password); 
            if (!isMatch)
                return response.status(401).json({ error: "Wrong Password || Unauthorized User" });

            const token = generateToken(patient.email, patient._id, patient.role);
            isMatch && response.cookie("token", token,{
                    httpnly:true,
                    secure:false,
                    sameSite:"lax"
            });
            patient.password = undefined;

            isMatch ? response.status(200).json({ message: "Login successful",patient }) : response.status(401).json({ error: "Unauthorized User" })

        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: "Internal Server Error" });
        }
    }



    export const signUpPatient = async (request, response, next) => {
        try {
            //  Validate patient
            console.log("signUpexecuted");
            const errors = validationResult(request);
            if (!errors.isEmpty())
                return response.status(400).json({ error: "Bad request |Data is Invalid", errorMessages: errors.array() });

            let { name, email, password, role } = request.body;
            let saltkey = await bcrypt.genSalt(10);
            password = bcrypt.hashSync(password, saltkey);
            await User.create({ name, email, password, role });
            await sendEmail(name, email);
            return response.status(201).json({ message: "SignIn Successfull | Please varify your account" });
        }
        catch (err) {
            console.log(err);
            return response.status(500).json({ error: "Internel sever Error", err });
        }

    }

    export const  verifyAccount = async (request, response, next) => {
        try {
            let { email } = request.body;
            // console.log("verify : ", email);
            let result = await User.updateOne({ email }, { $set: { "patientInfo.isVerified": true } });
            console.log("MongoDB Update Result:", result);

            if (result.matchedCount === 0)
                return response.status(404).json({ error: "User not found" });
            if (result.modifiedCount === 0)
                return response.status(200).json({ message: "Already verified" });

            return response.status(201).json({ message: "verification completed" })
        }
        catch (err) {
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
                <p>Welcome to know your patient. Please verify its you if not you dont accept the cookies.</p>
                <form method = "post" action = "http://localhost:3000/patient/verification">
                <input type = "hidden" name = "email" value =" ${email}" />
                <button type="submit" style="background-color: blue; color:white; width:200px; border: none; border: 1px solid gray; border-radius:10px;">Verify</button>
                </form>
                <p>
                <h6>ThankYou</h6>
                Know your patient .
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
        let payload = ({ "patientId": userid, "emailId": email, "role": role });
        return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });
    }


