import bcrypt from "bcrypt"; // Menggunakan 'bcrypt' bukan 'bcryptjs' sesuai package.json Anda
import jwt from "jsonwebtoken";
import User from "../Database/Table/user.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_both_files'; 

async function registerUser(req, res) {
    try {
        const { username, email, password, role, full_name, phone_number, profile_picture_url } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            role: role || 'user',
            full_name: full_name || null,
            phone_number: phone_number || null,
            profile_picture_url: profile_picture_url || null
        });

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: "User Created Successfully",
            token,
            userId: newUser.id,
            role: newUser.role
        });

    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: "Server Error During Registration", error: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // PERBAIKAN DI SINI: Gunakan user.password_hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login successful",
            token,
            userId: user.id,
            role: user.role
        });

    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: "Server Error During Login", error: error.message });
    }
}

function logoutUser(req, res) {
    res.status(200).json({ message: "Logout successful. Please remove token from client." });
}

async function getProfile(req, res) {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({ message: "User profile not found." });
        }

        res.status(200).json({
            message: "User profile retrieved successfully",
            user: user
        });

    } catch (error) {
        console.error('Error getting user profile:', error.message);
        res.status(500).json({ message: "Server error getting profile", error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { username, email, password, full_name, phone_number, profile_picture_url } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User profile not found." });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (full_name) updateData.full_name = full_name;
        if (phone_number) updateData.phone_number = phone_number;
        if (profile_picture_url) updateData.profile_picture_url = profile_picture_url;

        if (password) {
            updateData.password_hash = await bcrypt.hash(password, 10);
        }

        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ where: { email } });
            if (existingUserWithEmail) {
                return res.status(409).json({ message: "Email already taken by another user." });
            }
        }

        await user.update(updateData);

        res.status(200).json({ message: "Profile updated successfully!" });

    } catch (error) {
        console.error('Error updating user profile:', error.message);
        res.status(500).json({ message: "Server error updating profile", error: error.message });
    }
}

export { registerUser, loginUser, logoutUser, getProfile, updateProfile };