import User from "../models/User.js";

/**
 * Middleware to update the user's lastActive timestamp.
 * This should be placed AFTER any verifyToken middleware that Populates req.user or req.userId.
 */
export const trackActivity = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.userId;
        if (userId) {
            // Non-blocking update
            User.findByIdAndUpdate(userId, { lastActive: new Date() }).catch(err => 
                console.error("Activity Tracker Update Error:", err)
            );
        }
    } catch (err) {
        // Silently fail to ensure app functionality isn't interrupted by analytics failures
        console.error("Activity Tracker Middleware Error:", err);
    }
    next();
};
