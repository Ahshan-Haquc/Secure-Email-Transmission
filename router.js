const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./model');

const router = express.Router();
const SECRET_KEY = 'Ahsan';

// Registration endpoint
router.post('/register', async (req, res) => {
    const { firstName, lastName, batch, studentId, phoneNumber, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            batch,
            studentId,
            phoneNumber,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { usernameOrId, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ email: usernameOrId }, { studentId: usernameOrId }],
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ success: true, token, message: 'Login successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});

module.exports = router;
