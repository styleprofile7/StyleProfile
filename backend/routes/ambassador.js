import express from 'express';
import rateLimit from 'express-rate-limit';
import ClosetItem from '../models/ClosetItems.js';
import User from '../models/Users.js';

const router = express.Router();

/* Limiter (5 per hour) */
const ambassadorLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: "Too many ambassador checks. Try later." }
});

/* POST /api/ambassador/check */
router.post('/check', ambassadorLimiter, async (req, res, next) => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(req.userId);
        const items = await ClosetItem.find({ user: req.userId });

        const score = 
              (items.length * 10)
            + (user.loginStreak * 5)
            + (user.engagementScore || 0);

        const eligible = score >= 100;

        res.json({
            eligible,
            score,
            needed: eligible ? 0 : 100 - score,
            breakdown: {
                uploads: items.length,
                streak: user.loginStreak,
                engagement: user.engagementScore || 0
            }
        });

    } catch (err) {
        next(err);
    }
});

export default router;
