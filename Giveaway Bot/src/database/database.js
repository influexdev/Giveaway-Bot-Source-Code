const mongoose = require("mongoose");

async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("MongoDB connection failed!");
        console.error("Error:", error.message);
        console.error("Code:", error.code || "N/A");
        console.error("Name:", error.name || "N/A");

        process.exit(1);
    }
}

module.exports = connectDatabase;