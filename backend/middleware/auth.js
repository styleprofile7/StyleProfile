// This file acts as a bridge between the request and the route
// Checks if token is provided, verify any keys that need verification
// Extracts payload information, etc.

import jwt from 'jsonwebtoken';
import 'dotenv/config';

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer')){
        const token = authHeader.split(' ')[1]; // Extract the J.W.T
        console.log('Delete this log when done testing --- Received Bearer Token:', token);
        try {
            const verification = jwt.verify(token, process.env.JWT_SECRETKEY);
            req.userId = verification.userId;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" })
        }
    } else {
        res.status(401).send('Authorization could not be properly verified.');
    };
};