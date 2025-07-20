import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
export const auth = async (request, response, next) => {
    try {
        let {token} = request.cookies;
        if(!token){
         return response.status(401).json({ error: "Unauthorized | Token missing" });
        }
            // Verify and decode  token
        let decodedData = jwt.verify(token,process.env.SECRET_KEY)
        
        request.user = decodedData; //all taken data available here
        next();

    } catch (error) {
         console.log(error);
        return response.status(401).json({ error: "Token not fond || Invalid or expired token || Unauthorized User" });
    }
}


