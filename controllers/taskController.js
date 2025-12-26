const db = require("../config/db");

// 1. CHAIR: Create and Assign Task
exports.createTask = (req, res) => {
    const { title, description, priority, deadline, assigned_to } = req.body;
    const created_by = req.user.id; 

    const sql = "INSERT INTO tasks (title, description, priority, deadline, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [title, description, priority, deadline, assigned_to, created_by], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Task assigned successfully!", taskId: result.insertId });
    });
};

// 2. EMPLOYEE: View assigned tasks
exports.getEmployeeTasks = (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT *, 
        TIMESTAMPDIFF(HOUR, NOW(), deadline) AS hours_left,
        TIMESTAMPDIFF(MINUTE, NOW(), deadline) % 60 AS mins_left
        FROM tasks 
        WHERE assigned_to = ?
        ORDER BY created_at DESC`;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// 3. EMPLOYEE: Update Task Status
exports.updateTaskStatus = (req, res) => {
    const { taskId, status } = req.body;
    const userId = req.user.id;

    const sql = "UPDATE tasks SET status = ? WHERE id = ? AND assigned_to = ?";

    db.query(sql, [status, taskId, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No task found matching this ID for this user." });
        }
        res.status(200).json({ message: "Status updated successfully!" });
    });
};

// 4. CHAIR: View assigned tasks history (CRITICAL UPDATE)
exports.getChairTasks = (req, res) => {
    const chairId = req.user.id;
    // We MUST fetch u.is_active so the frontend can see the "Revoked" status
    const sql = `
        SELECT t.*, u.name as employee_name, u.is_active 
        FROM tasks t 
        JOIN users u ON t.assigned_to = u.id 
        WHERE t.created_by = ? 
        ORDER BY t.created_at DESC`;

    db.query(sql, [chairId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });

};