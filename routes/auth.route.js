
const router = require("express").Router();
const express = require('express');
const admin = require('../firebase/admin');
const User = require('../models/User');

// Request OTP
router.post('/auth/login', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Check if the user exists
        let user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Send OTP via Firebase
        // Send OTP using Firebase
        const verificationId = await admin
            .auth()
            .createCustomToken(phone, { expiresIn: '5m' }); // OTP valid for 5 minutes
            
        res.json({ message: 'OTP sent successfully', verificationId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone and OTP are required' });
        }

        // Verify OTP via Firebase
        const decodedToken = await admin.auth().verifyIdToken(otp);
        if (decodedToken.phone_number !== phone) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        res.json({ message: 'Phone number verified successfully', token: decodedToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'OTP verification failed' });
    }
});

module.exports = router;
