import User from '../models/User.js'
import mongoose from 'mongoose';

export const searchUser = async (req, res) => {
    const { q, type} = req.query;
    try {
        if(type === 'less') {
            const users = await User.find({ $or: [{nickname: { $regex: q, $options: "i" }}, {fullname: { $regex: q, $options: "i" }}] }).select('-password').limit(3)
            
            res.json(users)
        }

        if(type === 'more') {
            const users = await User.find({ $or: [{nickname: { $regex: q, $options: "i" }}, {fullname: { $regex: q, $options: "i" }}] }).select('-password').limit(20);

            res.json(users)
        }
        
    } catch (error) {
        console.log(error);
    }
}

export const getUserById = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if(user) {
            res.json({ success: true, user: user });
        }
        else {
            res.status(404).json({success: false,  message: 'User not found'})
        }
    } catch (error) {
        console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
    }
    
}

export const follow = async (req, res) => {
    const nickname = req.params.nickname;

    try {
        const user = await User.findOne({nickname: nickname}).select('-password');
        const me = await User.findById(req.userId).select('-password');
        if(user) {
            let followers = user.followers;
            let followings = me.followings;

            const isFollowed = followers.includes(req.userId);
            if(!isFollowed) {
                followers = [...followers, req.userId];
                followings = [...followings, user._id]
            }
            else {

                followers = followers.filter(follower => follower.toString()  !== req.userId);
                followings = followings.filter(following => following.toString()  !== user._id.toString());
            }
            
            const followed = await User.findByIdAndUpdate({_id: user._id}, {followers: followers}, {new : true});
            const following = await User.findByIdAndUpdate({_id: req.userId}, {followings: followings}, {new : true});
            if(!followed) {
               return res.status(401).json({success: false, message: 'Invalid a error'})
            }

            res.json({success: true, message: 'Following'})

            
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

export const getUserFollowings = async (req, res) => {
    const userId = req.userId;
    const {limit} = req.query;
    if(userId) {
        try {

            const user = await User.findById(userId);
            if(user) {
                let followingsId = user.followings;
                const followings = await User.find({'_id' : {$in : followingsId}}).limit(limit);
                
                res.json(followings);
            }
            

        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }
}

export const getUserSuggest = async (req, res) => {
    
    const {nickname ,limit} = req.query;
    try {
        const userSuggest = await User.find(nickname ? {nickname: {$nin : [nickname]}} : {}).sort({likes: -1}).limit(limit);

        res.json(userSuggest);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

export const editProfile = async (req, res) => {
    const userId = req.userId;
    const {avatar, nickname, fullname, bio} = req.body;

    try {
        const update = await User.findByIdAndUpdate({_id: userId}, { avatar: avatar, nickname: nickname, fullname: fullname, bio: bio });
        if(update) {
            res.json({ success: true, message: 'Update successfully'})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

//private
export const checkNickname = async (req, res) => {
    const { nickname } = req.body;
    try {
        const user = await User.find({nickname: nickname});
        if(user.length === 0) {
            res.json({ success: true, message: 'OK'})
        }
        else {
            res.json({ success: false, message: 'NOT OK'})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

