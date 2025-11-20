// Basic express app
import express from 'express';
import feed from './routes/feed.js';
import authMiddleware from './middleware/auth.js';

const app = express();

app.use('/api/feed', authMiddleware, feed);
app.use(express.json())
app.get('/', (req, res) => {
    res.send("Welcome to StyleProfile, Details Shipping...")
})

export default app