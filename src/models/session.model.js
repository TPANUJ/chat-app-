import mongoose from "mongoose";


const sessionSchema = new mongoose.Schema(
    
      {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
                required: [true, "user is required"]
            },
            refreshTokenHash: {
                type: String,
                required: [true, "refresh token is required"]
            },
            ip: {
                type: String,
                required: [true, "ip is required"]
            },
            userAgent: {//browser ke baare me janne ke liyee
                type: String,
                required: [true, "refresh token is required"]
            },
            revoked: {
                type: Boolean,
                default: false
            }
      },

        {
            timestamps: true
        }) 

const sessionModel = mongoose.model("sessions", sessionSchema)

export default sessionModel;