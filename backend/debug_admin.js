import './loadEnv.js';
import mongoose from 'mongoose';
import express from 'express';
import adminRoutes from './routes/adminRoutes.js';

async function debugRoutes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected.");

        // Mock Express Req/Res
        const req = { userId: "mock_admin_id" };
        const res = {
            status: function(s) { this.statusCode = s; return this; },
            json: function(data) { 
                console.log("RESPONSE STATUS:", this.statusCode || 200);
                if (this.statusCode === 500) {
                    console.error("ERROR DATA:", data);
                } else {
                    console.log("SUCCESS. Data keys:", Object.keys(data));
                    if (data.kpis) console.log("KPIs Sample:", JSON.stringify(data.kpis).slice(0, 100));
                }
            }
        };

        // We need to bypass the verifyAdmin middleware for the test
        // Let's find the route handler directly
        const statsRoute = adminRoutes.stack.find(s => s.route && s.route.path === '/stats').route.stack[1].handle;
        const usersRoute = adminRoutes.stack.find(s => s.route && s.route.path === '/users').route.stack[1].handle;

        console.log("\n--- TESTING /stats ---");
        await statsRoute(req, res, () => {});

        console.log("\n--- TESTING /users ---");
        await usersRoute(req, res, () => {});

        process.exit(0);
    } catch (e) {
        console.error("DEBUG SCRIPT CRASHED:", e);
        process.exit(1);
    }
}

debugRoutes();
