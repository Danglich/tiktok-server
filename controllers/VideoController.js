import Video from '../models/Video.js';
import User from '../models/User.js';
import { json } from 'express';


// Private
export const create = async (req,  res) => { 
    const {title, url, comment, regime} = req.body
    const userId = req.userId


    try {
        
        const newVideo = new Video({title: title, url: url, regime: regime, comment: comment, user: userId})
        await newVideo.save()
        res.json({
            success: true,
            message: 'Video created successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

//Publish
export const getVideosForYou = async ( req, res) => {
    const {userId} = req.query;
    try {
        const videos = await Video.find(userId ? {user: {$nin : [userId]}} : {}).sort({createAt: -1}).limit(50).populate('user', ['-password'])

        res.json(videos)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}


//Private
export const getVideoFollowing = async ( req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if(user) {
            const followersOfUser = user.followings;

            const videosFollowings = await Video.find({user : {$in : followersOfUser}}).sort({createAt: -1}).limit(50).populate('user', ['-password']);

            res.json(videosFollowings)
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
    
}

//Publish
export const getVideosOfUser = async (req, res) => {
    const nickname = req.params.nickname;
    const { quantity } = req.query

    try {
        const user = await User.findOne({ nickname: nickname }).select('-password');
        if(user) {
            if(quantity) {
                const video = await Video.findOne({user : user._id});
                res.json(video);
                
            }
            else {
                const videos = await Video.find({user: user._id});
                res.json({videos: videos, user: user})
            }
        }

        if(!user) {
            return res.status(400).json({ success: false, message: 'User not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
        
    }
}

//Private
export const getVideoLiked = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(user) {
            const videosLikedId = user.videosLiked;
            const videosLiked = await Video.find({_id : {$in : videosLikedId}}).populate('user', ['-password']).sort({createAt: -1});

            res.json(videosLiked)
        }
        else {
            return res.json({success: false, message: 'Not found user'})
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

//Publish 

export const getVideoById = async (req, res) => {
    const { videoId} = req.params;

    try {
        const video = await Video.findById({_id : videoId}).populate('user', ['-password']);;
        if(!video) {
            return res.status(400).json({ success: false, message: 'Not found video'});
        }
        res.json(video)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}

//Private 
export const like = async (req, res) => {
    const videoId = req.params.videoId;
    try {
        const user = await User.findById(req.userId).select('-password');
        const video = await Video.findById(videoId);

        const author = await User.findById(video.user).select('-password');

        if(user && video && author) {

            const isLiked = user.videosLiked.includes(videoId);

            let newVideoLiked;
            let likesOfVideo = video.likesCount;
            let likesOfAuthor = author.likes;
            if(isLiked) {
                newVideoLiked = user.videosLiked.filter(v => v.toString() !== videoId);
                likesOfAuthor = likesOfAuthor - 1;
                likesOfVideo = video.likesCount - 1;
                
            } else {
                newVideoLiked = [...user.videosLiked, videoId];
                likesOfAuthor = likesOfAuthor + 1;
                likesOfVideo = video.likesCount + 1;

            }

            console.log(likesOfAuthor);
            
            await Video.findByIdAndUpdate({_id : videoId}, {likesCount: likesOfVideo}, {new: true});
            await User.findByIdAndUpdate({_id : author._id} , {likes : likesOfAuthor}); 
            const liked = await User.findByIdAndUpdate({_id : req.userId}, {videosLiked : newVideoLiked })


            if(liked) {
                res.json({success: true, message:'Like successfully', likesCurrent: likesOfVideo})
            }

        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
} 

export const searchVideo = async (req, res) => {
    const { q} = req.query;
    try {
        const videos = await Video.find({title: { $regex: q, $options: "i" }} ).sort({likesCount: -1}).populate('user', ['-password']).limit(20);

        res.json(videos)
        
    } catch (error) {
        console.log(error);
    }
}

export const getVideoSuggest = async (req, res) => {
    const {userId, videoId} = req.query;
    try {
        const videos = await Video.find(userId ? {user: userId, _id: {$nin : [videoId]}} : {}).sort({createAt: -1}).limit(50).populate('user', ['-password'])

        res.json(videos)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }


}

export const deleteVideo = async (req, res) => {
    const {videoId} = req.params;
    try {
        
        const result = await Video.findOneAndDelete({_id: videoId, user: req.userId})
        if(result) {
            res.json({ success: true, message: 'Deleted'})
        }
        else {
            return res.status(404).json({ success: false, message: 'Not found video' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
    

    
}



