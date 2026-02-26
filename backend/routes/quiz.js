import express from 'express';
import User from '../models/Users.js';

const router = express.Router();

router.post('/', async (req, res) =>{
    try {
        const { answers } = req.body;

        if (!answers) {
           return res.status(400).json({ messgae : "No answer was found"});
        }

        // placeholder - very basic scoring logic
        const counts = {};

        answers.forEach(ans => {
            counts[ans] = (counts[ans] || 0) + 1;
        });

        const archetype = Object.keys(counts).reduce((a,b) =>
            counts[a] > counts[b] ? a : b 
        );

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    "styleProfile.archetype" : archetype,
                    "styleProfile.rawAnswers" : answers
                },
                $inc : {points : 10}
            },
            { new : true}
        );
        
        if (!updatedUser) {
            return res.status(404).json( { messgae : "User not found"})
        }

        return res.json({
            message: "Quiz completed",
            archetype,
            pointsAdded : 10,
            updatedPoints : updatedUser.points
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message : "Server error"})
    }
    

});

export default router;