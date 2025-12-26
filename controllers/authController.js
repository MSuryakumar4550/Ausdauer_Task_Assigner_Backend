const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTER
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)";
        db.query(sql, [name, email, hashedPassword, role || 'EMPLOYEE'], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// 2. LOGIN (Now with Inactive Account Protection)
exports.login = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];

        // STRAIGHTFORWARD SECURITY: If account is revoked, block login immediately
        if (user.is_active === 0) {
            return res.status(403).json({ message: "Your access has been revoked. Please contact the Chairperson." });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'fallback_secret', 
                { expiresIn: "1d" }
            );

            res.json({
                message: "Login successful",
                token,
                user: { id: user.id, name: user.name, role: user.role }
            });
        } catch (bcryptErr) {
            return res.status(500).json({ error: "Server error" });
        }
    });
};

// 3. GET EMPLOYEES (Fixed: Filters out revoked users)
exports.getAllEmployees = (req, res) => {
    // We only want users who are both EMPLOYEES and currently ACTIVE
    const sql = "SELECT id, name, email FROM users WHERE role = 'EMPLOYEE' AND is_active = 1";
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};