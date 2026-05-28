import express from 'express';
import morgan from 'morgan';
import cors from "cors"; 
import authRouter from './routes/auth.routes.js';
import cookieParser from "cookie-parser";



const app = express();


app.use(cors({
  origin: "http://127.0.0.1:5500", // your frontend URL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); //ye middleware req res ka record rakhte hai




app.get("/",(req,res)=>{
    res.send("server is working, welcome")

})
 app.use("/api/auth", authRouter);
  

export default app; 