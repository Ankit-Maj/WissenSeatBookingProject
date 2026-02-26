const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Session = require("./models/Session");

const seed = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Clear existing data
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Session.deleteMany({});

        const password = await bcrypt.hash("password123", 10);

        const squads = ["Squad1", "Squad2", "Squad3", "Squad4", "Squad5"];

        // Create 50 users (25 per batch)
        console.log("Creating 50 sample users...");
        const users = [];
        for (let i = 1; i <= 50; i++) {
            const batch = i <= 25 ? "BatchA" : "BatchB";
            const squad = squads[Math.floor(Math.random() * squads.length)];
            const username = `user_${i}`;
            const user = await User.create({
                username,
                email: `${username}@example.com`,
                password,
                batch,
                squad
            });
            users.push(user);
        }
        console.log("Users created.");

        // Generate 20 sessions starting from today
        console.log("Generating 20 sessions...");
        const sessions = [];
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 20; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            const day = date.getDay();
            if (day === 0 || day === 6) continue; // Skip weekends

            const reservedForBatch = i % 2 === 0 ? "BatchA" : "BatchB";

            const session = await Session.create({
                date,
                reservedForBatch,
                isHoliday: false,
                bookings: []
            });
            sessions.push(session);
        }
        console.log("Sessions generated.");

        // Populate bookings (50% capacity)
        console.log("Populating bookings (50% capacity)...");
        for (let session of sessions) {
            // 50% of 40 reserved = 20 bookings
            // 50% of 10 floating = 5 bookings

            const reservedUsers = users.filter(u => u.batch === session.reservedForBatch).slice(0, 20);
            const otherUsers = users.filter(u => u.batch !== session.reservedForBatch).slice(0, 5);

            const sessionBookings = [];

            // Book reserved seats
            for (let i = 0; i < reservedUsers.length; i++) {
                const u = reservedUsers[i];
                const seatNumber = i + 1; // 1-20
                sessionBookings.push({
                    userId: u._id,
                    username: u.username,
                    seatNumber,
                    type: "reserved",
                    status: "active",
                    bookedAt: new Date()
                });
            }

            // Book floating seats
            for (let i = 0; i < otherUsers.length; i++) {
                const u = otherUsers[i];
                const seatNumber = 41 + i; // 41-45
                sessionBookings.push({
                    userId: u._id,
                    username: u.username,
                    seatNumber,
                    type: "floating",
                    status: "active",
                    bookedAt: new Date()
                });
            }

            await Session.findByIdAndUpdate(session._id, {
                $set: { bookings: sessionBookings }
            });
        }
        console.log("Bookings populated.");

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();
