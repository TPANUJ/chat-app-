
import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"; 
import config from "../config/config.js";
import { log } from "console";
import cookieParser from "cookie-parser";
import sessionModel from "../models/session.model.js";

export async function register(req,res){

    console.log("register api");
    

    //data jo needed hai hm request se nikal lenge pahle 1
    const {username, email, password} = req.body;

    //ab check krenge ki is username or email se koi user pahle se to nhi hai 2
    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    //agr user already registered hai to error send kr denge 3
    if (isAlreadyRegistered){
       return res.status(409).json({
            message: "username or email already exists"
        })
    }

    //ab password ko plain text me to store krenge nhi to usko hashed form me strore krneg e to use krenge crypto or bcrypt --4
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    //ab exact us user ko banayenge
    //yanhi pr server data ko database me save krta hai--5
    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

      // ab server refresh token create krega ---7
    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
    expiresIn: "7d"
        })


    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    //session create krenge
    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers[ "user-agent"]

    })
    //ab server accesstoken create kr ke user ko send krega --6
    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
{
    expiresIn: "15m"
        })  

  

res.cookie("refreshToken", refreshToken, {//-----8
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
});

return res.status(201).json({
    message: " registered succesfully",
    user:{
        username: user.username
    },
    accessToken  //access token ko js variable me store krna hota hai is liye use response ke sath send krna padta hai
})
}

//-------------------------------user login api ka logic likhenge

export async function getMe(req,res){

    //pahle pata kreneg ki kon sa user hai to uske liye token nikalenge req se
    const token =
  req.cookies.token ||
  req.headers.authorization?.split(" ")[1];


    //agr req me token nhi aaya hai to ye response send kr denge
    if (!token) {
        return res.status(401).json({
            message: "token is required"
        })
    }

    
    //ab us token se user ki detail nikalenge
    const decoded = jwt.verify(token, config.JWT_SECRET)
    

    //Ab us user ko find krenge or uski details database se send kr denge
    const user = await userModel.findById(decoded.id)

  

    res.status(200).json({
        message: "user fetched succesfully",
        user: {
            username: user.username,
            email: user.email
        }
    })
}

//---------------user login api

export async function login(req, res){

    const { email, password} = req.body;

    const user = await userModel.findOne({
        $or: [
            
            {email}
        ]
    })

    if(!user){
        return res.status(402).json({message: "invalid"})
    }

    const hashedInputPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedInputPassword === user.password;

    if(!isPasswordValid){
        return res.status(401).json({message: "invalid password"})
    }


     const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
    expiresIn: "7d"
        })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex"); 

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers[ "user-agent"]

    })

   const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
{
    expiresIn: "15m"
        })  


res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 7*24 * 60 * 60 * 1000
});

     res.status(201).json({
        message: "user logged in succesfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
        accessToken
    })
}

//-------------api to generate access token using refresh token
export async function refreshToken(req, res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
           message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex"); 

         const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

     if(!session){
        return res.status(400).json({
            message: "invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET, 
    {
        expiresIn: "15m"
    })

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET,
     {
        expiresIn: "7d"
    })

            const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshTokene).digest("hex"); 

            session.refreshTokenHash = newRefreshTokenHash;
            await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
     res.status(200).json({
        message:"access token refreshed succesfully",
        accessToken
     })
}

export async function logout(req, res){
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        res.status(400).json({
            message: "refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex"); 

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if(!session){
        return res.status(400).json({
            message: "invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "logout succesfully"
    })
}

export async function logoutAll(req, res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
           message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })
}




