import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify token and admin role
export const verifyAdmin = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        
        // Fetch user from DB to ensure role is up to date
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }
        
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};
