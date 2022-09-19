import express from 'express';
import { searchUser } from '../controllers/UserController.js';
import { searchVideo } from '../controllers/VideoController.js';
const router = express.Router();
import User from '../models/User.js';
import Video from '../models/Video.js';

router.get('/', async (req, res) => {
    const { q, type} = req.query;
    try {
        if(type === 'less') {
            const users = await User.find({ $or: [{nickname: { $regex: q, $options: "i" }}, {fullname: { $regex: q, $options: "i" }}] }).select('-password').limit(3)
            const videos = await Video.find({title: { $regex: q, $options: "i"}}).sort({likesCount: -1}).populate('user', ['-password']).limit(6);
            res.json({users, videos});
        }

        if(type === 'more') {
            const users = await User.find({ $or: [{nickname: { $regex: q, $options: "i" }}, {fullname: { $regex: q, $options: "i" }}] }).select('-password').limit(10);
            const videos = await Video.find({title: { $regex: q, $options: "i"}}).sort({likesCount: -1}).populate('user', ['-password']).limit(20);

            res.json({users, videos})
        }
        
    } catch (error) {
        console.log(error);
    }
    
})

router.get('/user', searchUser)
router.get('/video', searchVideo)

export default router