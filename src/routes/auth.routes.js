import { Router } from "express";
import * as authController from "../controllers/auth.controller.js"

const authRouter = Router();

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login) //yanha kewal declare kr rhe hai api 
authRouter.get("/getMe", authController.getMe)
authRouter.get("/refresh-token", authController.refreshToken)
authRouter.get("/logout", authController.logout)
authRouter.get("/logout-all", authController.logoutAll)

export default authRouter;