import {Router } from "express";
import *as messageController from "../controllers/message.controller"

const chatRouter = Router();


chatRouter.get("/users", messageController.getUser)


export default chatRouter;