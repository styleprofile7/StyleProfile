import express from 'express';
import ClosetItem from '../models/ClosetItems.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

/* Rate Limiter: Moodboard (20 per minute) */
const moodLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { message: "Too many requests. Slow down." }
});

/* GET /api/moodboard */
router.get('/', moodLimiter, async (req, res, next) => {
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

        const items = await ClosetItem.find({ user: req.userId });

        if (items.length === 0) {
            return res.json({
                message: "No items found, returning fallback moodboard",
                moodboard: {
                    theme: "minimal",
                    colors: ["#ccc", "#eee"],
                    images: []
                }
            });
        }

        const sample = items.slice(0, 8);

        const moodboard = {
            theme: "auto-generated",
            colors: ["#333", "#444", "#555"],
            images: sample.map(item => item.imageUrl),
        };

        res.json({ moodboard });

    } catch (err) {
        next(err);
    }
});

export default router;
