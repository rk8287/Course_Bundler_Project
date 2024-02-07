import mongoose from "mongoose";

export const ConnectDb = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URI, {
            
           });

        console.log(`MongoDb is connected with ${connection.host}`);
    } catch (error) {
        console.error(`MongoDb connection error: ${error.message}`);
    }
};
