import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';

export const login = async (req, res) => {
    const { nickname, password } = req.body;
    if (!nickname || !password) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu tên đăng nhập hoặc mật khẩu!',
        });
    }

    try {
        let user = await User.findOne({ nickname: nickname });
        //check nickname
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
            });
        }

        //check password
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!',
            });
        }

        //all good
        //Return token
        const accessToken = jwt.sign(
            { userId: user._id, isAdmin: user.roleId === 1 },
            process.env.ACCESS_TOKEN_SECRET,
        );
        res.json({
            success: true,
            message: 'Logged in successfully!',
            accessToken,
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const register = async (req, res) => {
    const { nickname, password, fullname } = req.body;

    //Simple Validation
    if (!nickname || !password) {
        return res.status(400).json({
            success: false,
            message: 'Thiếu tên đăng nhập hoặc mật khẩu!',
        });
    }

    try {
        const user = await User.findOne({ nickname: nickname }).select(
            '-password',
        );

        if (user) {
            return res.status(400).json({
                success: false,
                message:
                    'Tên đăng nhập đã tồn tại, vui lòng thử tên đăng nhập khác!',
            });
        }
        // All good
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({
            ...req.body,
            password: hashedPassword,
        });
        await newUser.save();

        // Return token
        const accessToken = jwt.sign(
            { userId: newUser._id, isAdmin: newUser.roleId === 1 },
            process.env.ACCESS_TOKEN_SECRET,
        );
        res.json({
            success: true,
            message: 'User created successfully',
            accessToken,
            user: newUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const verify = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
