const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Send 'has_completed_setup' so frontend knows where to redirect
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                has_completed_setup: user.has_completed_setup || false 
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};