import mongoose from 'mongoose';
import User from './models/Users.js';
import ClosetItem from './models/ClosetItems.js';

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});
    await ClosetItem.deleteMany({});

    const users = await User.insertMany([
        { email: "user1@test.com", password: "pass", loginStreak: 4 },
        { email: "user2@test.com", password: "pass", loginStreak: 8 },
        { email: "user3@test.com", password: "pass", loginStreak: 3 },
        { email: "user4@test.com", password: "pass", loginStreak: 1 },
        { email: "user5@test.com", password: "pass", loginStreak: 7 },
    ]);

    for (const u of users) {
        await ClosetItem.insertMany([
            { title: "Black Hoodie", imageUrl: "/uploads/sample1.png", user: u._id },
            { title: "White Tee", imageUrl: "/uploads/sample2.png", user: u._id },
            { title: "Blue Jeans", imageUrl: "/uploads/sample3.png", user: u._id },
        ]);
    }

    console.log("Seed complete");
    process.exit();
}

seed();
