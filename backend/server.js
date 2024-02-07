import app from '../backend/app.js';
import { ConnectDb } from './config/database.js';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import nodeCron from 'node-cron'
import { Stats } from './models/Stats.js';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const instance = new Razorpay({
    key_id :process.env.RAZAR_PAY_API_KEY,
    key_secret: process.env.RAZAR_PAY_SECRET_KEY
})


nodeCron.schedule("0 0 0 1 * *", async ()=>{

try {
    await Stats.create({

    })
} catch (error) {
    console.log(error.message);
}
});


const PORT = process.env.PORT || 3000;

ConnectDb();



app.listen(PORT, () => {
    console.log(`Server is Running on port ${process.env.PORT}`);
});
