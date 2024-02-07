import express from "express";
import {config} from "dotenv";
import cookies from "cookie-parser";


config({
    path:'./config/config.env',
})

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookies());


import course from './routes/courseRoutes.js'
import user from './routes/userRoutes.js'
import payment from './routes/paymentRoutes.js'
import other from './routes/otherRoutes.js'

import ErrorMildleware from "./middlewares/Error.js";

app.use('/api/v1',course);
app.use('/api/v1',user);
app.use('/api/v1',payment);
app.use('/api/v1',other);



const PORT = process.env.PORT || 3000; 

export default app;

app.use(ErrorMildleware);

