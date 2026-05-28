import userModel from "../models/user.model.js"
import messageModel from "../models/message.model.js";

export async function getUser(req, res){

       try {

      const users = await User.find().select("-password");

      res.json(users);

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }

}

export async function getMessages(req, res) {

   try {

      const senderId = req.user.id;     
      const receiverId = req.params.id; 

      const messages = await Message.find({

         $or: [

            {
               sender: senderId,
               receiver: receiverId
            },

            {
               sender: receiverId,
               receiver: senderId
            }

         ]

      });

      res.json(messages);

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }

}

