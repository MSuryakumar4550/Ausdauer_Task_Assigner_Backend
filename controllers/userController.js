const db = require("../config/db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// --- CONFIGURATION ---
const appName = "Ausdauer Pulse"; // Change this later to whatever you like

// 1. EMAIL CONFIGURATION
// TRAP: Ensure you use an 'App Password' from Google, not your regular password.
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "muvsuryakumar@gmail.com", 
        pass: "ptce njmf nnqb oorj"    
    }
});

// 2. CHAIR: Add New User
exports.addNewUser = async (req, res) => {
    console.log("Registration Attempt Data:", req.body); 

    const { name, email, password, role, designation } = req.body;
    
    if (!name || !email || !password || !designation) {
        return res.status(400).json({ error: "Missing fields! Ensure designation is filled." });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO users (name, email, password, role, designation, is_active) VALUES (?, ?, ?, ?, ?, 1)";
        
        db.query(sql, [name, email, hashedPassword, role || 'EMPLOYEE', designation], (err, result) => {
            if (err) {
                console.error("SQL Error:", err.message);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: "This email is already registered!" });
                }
                return res.status(500).json({ error: `Database Error: ${err.message}` });
            }
            res.status(201).json({ message: "User created successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Server encryption error" });
    }
};

// 3. ALL: Update Profile (Includes Password if OTP matches)
exports.updateProfile = async (req, res) => {
    const { name, designation, otp, newPassword } = req.body;
    const userId = req.user.id;

    const profileSql = "UPDATE users SET name = ?, designation = ? WHERE id = ?";
    db.query(profileSql, [name, designation, userId], async (err) => {
        if (err) return res.status(500).json({ error: "Failed to update basic profile info" });

        if (newPassword && otp) {
            db.query("SELECT reset_token FROM users WHERE id = ?", [userId], async (otpErr, results) => {
                if (otpErr) return res.status(500).json({ error: "Database error during OTP check" });

                if (!results[0]?.reset_token || String(results[0].reset_token) !== String(otp)) {
                    return res.status(400).json({ message: "Profile updated, but OTP was incorrect or expired!" });
                }

                const hashedPass = await bcrypt.hash(newPassword, 10);
                db.query("UPDATE users SET password = ?, reset_token = NULL WHERE id = ?", [hashedPass, userId], (passErr) => {
                    if (passErr) return res.status(500).json({ error: "Password update failed" });
                    return res.status(200).json({ message: "Full Profile & Password updated successfully!" });
                });
            });
        } else {
            res.status(200).json({ message: "Profile info updated successfully!" });
        }
    });
};

// 4. CHAIR: Remove Employee (Soft Delete/Revoke Access)
exports.removeEmployee = (req, res) => {
    const employeeId = req.params.id;
    const sql = "UPDATE users SET is_active = 0 WHERE id = ? AND role = 'EMPLOYEE'";
    db.query(sql, [employeeId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Access revoked successfully!" });
    });
};

// 5. ALL: Request Verification Code (Sends real email + Debug log)
exports.requestVerification = (req, res) => {
    const userId = req.user.id;
    const otp = Math.floor(100000 + Math.random() * 900000);

    db.query("SELECT email FROM users WHERE id = ?", [userId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: "User not found" });

        const userEmail = results[0].email;
        
        console.log(`\n-----------------------------------------`);
        console.log(`[SECURITY] Generated OTP for ${userEmail}: ${otp}`);
        console.log(`-----------------------------------------\n`); 

        const mailOptions = {
            from: `"${appName} Security" <your-email@gmail.com>`, // Uses Dynamic App Name
            to: userEmail,
            subject: `[${appName}] Security Verification Code`,
            html: `
                <div style="font-family: sans-serif; background-color: #020617; color: white; padding: 40px; border-radius: 15px; border: 1px solid #1f2937; max-width: 500px; margin: auto;">
                    <h2 style="color: #8b5cf6; text-align: center; margin-bottom: 20px;">${appName} Security</h2>
                    <p style="text-align: center; color: #9ca3af;">You requested a password change. Please use the verification code below to authorize this action.</p>
                    <div style="background: #0f172a; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0; border: 1px solid #8b5cf6;">
                        <h1 style="letter-spacing: 10px; color: #10b981; margin: 0; font-size: 2.5rem;">${otp}</h1>
                    </div>
                    <p style="font-size: 0.8rem; color: #6b7280; text-align: center; margin-top: 20px;">
                        This code is valid for 10 minutes. If you did not request this, please secure your account immediately.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;">
                    <p style="font-size: 0.75rem; color: #4b5563; text-align: center;">© 2025 ${appName} Systems. All rights reserved.</p>
                </div>
            `
        };

        db.query("UPDATE users SET reset_token = ? WHERE id = ?", [otp, userId], (dbErr) => {
            if (dbErr) return res.status(500).json({ error: "Failed to store verification code" });

            transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) {
                    console.error("Mail Send Error:", mailErr.message);
                    return res.status(200).json({ message: "OTP generated! (Mail failed, check server terminal)" });
                }
                res.status(200).json({ message: "Verification code sent to your email!" });
            });
        });
    });
};