import express from 'express';
import User from '../models/Users.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
    const {name, email, password} = req.body;

    // check if email and password exists 
    if (!email || !password) {
        return res.status(400).json({ message : "Email and Password Required"})
    };

    // check if the email exists within the database
    const userExists = await User.findOne({email});
    if (userExists){
        return res.status(400).json({ message: "Email already registered"})
    };
    
    
    // hash password
    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
        email,
        name,
        passwordHash : hash,
        points : 0,
        styleProfile: {}
    });
    
    await newUser.save();
    
    // generate JWT token
    const JWTkey = process.env.JWT_SECRETKEY;
    const payload = {
        userId : newUser._id,
        email : newUser.email
    };
    const options = {
        expiresIn : '7d'
    };
    // sign the token
    const token = jwt.sign(payload, JWTkey, options);
    
    // return response
    return res.json({
        message : "Registration successful",
        token,
        user : {
            id : newUser._id,
            email : newUser.email,
            name : newUser.name,
            points : newUser.points
        }
    });

    
});

router.post('/login', async(req, res) => {
    //  Email and password extraction
    const { email, password} = req.body;

       // check if email and password exists 
    if (!email || !password) {
        return res.status(400).json({ message : "Email and Password Required"})
    };


    // Check if user exists
    const userExists = await User.findOne({email});
    if (!userExists){
        return res.status(400).json({ message: "Email or Password not valid"})
    };

    const isMatch = await bcrypt.compare(password, userExists.passwordHash);
    if (isMatch == false){
        return res.status(400).json({ message: "Email or Password not valid"})
    };

        
    // generate JWT token
    const JWTkey = process.env.JWT_SECRETKEY;
    const payload = {
        userId : userExists._id,
        email : userExists.email
    };
    const options = {
        expiresIn : '7d'
    };
    // sign the token
    const token = jwt.sign(payload, JWTkey, options);

    return res.json({
        message : "Login Successfully",
        token,
        user : {
            id : userExists._id,
            email : userExists.email,
            name : userExists.name,
            points : userExists.points
        }
    });


});

export default router;