const jwt = require("jsonwebtoken");
const db = require("../config/db");

// 1. VERIFY TOKEN & ACTIVE STATUS
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "No token provided!" });
    }

    const bearerToken = token.split(" ")[1] || token;

    jwt.verify(bearerToken, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized! Invalid token." });
        }

        // STRAIGHTFORWARD DB CHECK
        db.query("SELECT is_active FROM users WHERE id = ?", [decoded.id], (dbErr, results) => {
            // TRAP: results[0].is_active === 0 must return 403, not 401
            if (dbErr || results.length === 0 || results[0].is_active === 0) {
                // Changing to 403 so Frontend triggers the Blocked UI
                return res.status(403).json({ message: "Account deactivated. Access Forbidden." });
            }
            
            req.user = decoded; 
            next();
        });
    });
};

// 2. ROLE CHECK MIDDLEWARE
const isChair = (req, res, next) => {
    if (!req.user || req.user.role !== "CHAIR") {
        return res.status(403).json({ message: "Access Denied: Requires Chairperson Role!" });
    }
    next();
};

module.exports = { verifyToken, isChair };