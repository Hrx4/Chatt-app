const mongoose = require("mongoose")
mongoose.set('strictQuery', true);

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI );
        console.log(`Mongo Connected ${conn.connection.host}`.cyan.underline.bold);

    } catch (error) {
        console.log(`Error : ${error.message}`.red.bold);
        process.exit();
    }
};
module.exports = connectDB;