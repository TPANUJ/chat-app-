import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },

    message: {
        type: String,
        required: true
    }

}, { timestamps: true });

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;