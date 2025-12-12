// Import and start the server

import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { message: "Too many requests" }
});

app.use(globalLimiter);


async function serverConnection() {
    try {
        const uri = process.env.MONGODB_URI
        const port = process.env.PORT
        // Connect to MongoDB
        await mongoose.connect(uri);
        console.log("MongoDB Connected !")
        
        // Starts the server and waits for incoming requests on the specific port
        app.listen(port, function(err){
            if (err) { // error handling for the server to listen to
            console.log('Error starting server:', err);
            } else { // If the server is up and running continue 
            console.log(`Server is running on port ${port}`);
            }
        })
      } catch (error) {
          console.error('MongoDB connection error:', error);
      }
}

// Global Error handling

app.use((err, req, res, next) => {
    console.error("API Error:", err);

    if (err instanceof SyntaxError) {
        return res.status(400).json({ message: "Invalid JSON body" });
    }

    res.status(500).json({
        message: "Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


serverConnection();