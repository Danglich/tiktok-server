import Video from '../models/Video.js';
import User from '../models/User.js';
import { json } from 'express';

// Private
export const create = async (req, res) => {
    const { title, url, comment, regime } = req.body;
    const userId = req.user.userId;

    try {
        const newVideo = new Video({
            title: title,
            url: url,
            regime: regime,
            comment: comment,
            user: userId,
        });
        await newVideo.save();
        res.json({
            success: true,
            message: 'Video created successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

//Publish
export const getVideosForYou = async (req, res) => {
    const { userId, page } = req.query;
    const perPage = 4;

    try {
        const videos = await Video.find(
            userId ? { user: { $nin: [userId] } } : {},
        )
            .sort({ _id: -1 })
            .populate('user', ['-password'])
            .skip(page * perPage - perPage)
            .limit(perPage);

        res.json(videos.filter((v) => v.user));
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

//Private
export const getVideoFollowing = async (req, res) => {
    const perPage = 4;
    const userId = req.user.userId;
    const pageNumber = req.query.page;

    try {
        const user = await User.findById(userId);
        if (user) {
            const followersOfUser = user.followings;

            const videosFollowings = await Video.find({
                user: { $in: followersOfUser },
            })
                .sort({ createdAt: -1 })
                .populate('user', ['-password'])
                .skip(pageNumber * perPage - perPage)
                .limit(perPage);

            res.json(videosFollowings.filter((v) => v.user));
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

//Publish
export const getVideosOfUser = async (req, res) => {
    const nickname = req.params.nickname;
    const { quantity } = req.query;

    try {
        const user = await User.findOne({ nickname: nickname }).select(
            '-password',
        );
        if (user) {
            if (quantity) {
                const video = await Video.findOne({ user: user._id });
                res.json(video);
            } else {
                const videos = await Video.find({ user: user._id });
                res.json({ videos: videos, user: user });
            }
        }

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

//Private
export const getVideoLiked = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user) {
            const videosLikedId = user.videosLiked;
            const videosLiked = await Video.find({
                _id: { $in: videosLikedId },
            })
                .populate('user', ['-password'])
                .sort({ createdAt: -1 });

            res.json(videosLiked.filter((v) => v.user));
        } else {
            return res.json({ success: false, message: 'Not found user' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

//Publish

export const getVideoById = async (req, res) => {
    const { videoId } = req.params;

    try {
        const video = await Video.findById({ _id: videoId }).populate('user', [
            '-password',
        ]);
        if (!video) {
            return res
                .status(400)
                .json({ success: false, message: 'Not found video' });
        }
        res.json(video);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

//Private
export const like = async (req, res) => {
    const videoId = req.params.videoId;
    try {
        const user = await User.findById(req.user.userId).select('-password');
        const video = await Video.findById(videoId);

        const author = await User.findById(video.user).select('-password');

        if (user && video && author) {
            const isLiked = user.videosLiked.includes(videoId);

            let newVideoLiked;
            let likesOfVideo = video.likesCount;
            let likesOfAuthor = author.likes;
            if (isLiked) {
                newVideoLiked = user.videosLiked.filter(
                    (v) => v.toString() !== videoId,
                );
                likesOfAuthor = likesOfAuthor - 1;
                likesOfVideo = video.likesCount - 1;
            } else {
                newVideoLiked = [...user.videosLiked, videoId];
                likesOfAuthor = likesOfAuthor + 1;
                likesOfVideo = video.likesCount + 1;
            }

            console.log(likesOfAuthor);

            await Video.findByIdAndUpdate(
                { _id: videoId },
                { likesCount: likesOfVideo },
                { new: true },
            );
            await User.findByIdAndUpdate(
                { _id: author._id },
                { likes: likesOfAuthor },
            );
            const liked = await User.findByIdAndUpdate(
                { _id: req.user.userId },
                { videosLiked: newVideoLiked },
            );

            if (liked) {
                res.json({
                    success: true,
                    message: 'Like successfully',
                    likesCurrent: likesOfVideo,
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const searchVideo = async (req, res) => {
    const { q } = req.query;
    try {
        const videos = await Video.find({ title: { $regex: q, $options: 'i' } })
            .sort({ likesCount: -1 })
            .populate('user', ['-password'])
            .limit(20);

        res.json(videos.filter((v) => v.user));
    } catch (error) {
        console.log(error);
    }
};

export const getVideoSuggest = async (req, res) => {
    const { userId, videoId } = req.query;
    try {
        const videos = await Video.find(
            userId ? { user: userId, _id: { $nin: [videoId] } } : {},
        )
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', ['-password']);

        res.json(videos.filter((v) => v.user));
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const deleteVideo = async (req, res) => {
    const { videoId } = req.params;

    try {
        let result;
        if (req.user.isAdmin) {
            result = await Video.findOneAndDelete({
                _id: videoId,
            });
        } else {
            result = await Video.findOneAndDelete({
                _id: videoId,
                user: req.user.userId,
            });
        }
        if (result) {
            res.json({ success: true, message: 'Deleted' });
        } else {
            return res
                .status(404)
                .json({ success: false, message: 'Not found video' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// get All videos ( Admin )

export const getAllVideos = async (req, res) => {
    if (req.user.isAdmin) {
        const isNewQuery = req.query.new;
        try {
            const videos = isNewQuery
                ? await Video.find()
                      .populate('user', ['-password'])
                      .sort({ createdAt: -1 })
                      .limit(10)
                : await Video.find()
                      .populate('user', ['-password'])
                      .sort({ createdAt: -1 });

            res.json(videos);
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json({
            success: false,
            message: 'You are not authticate',
        });
    }
};

//get stats
export const getStats = async (req, res) => {
    const year = new Date().getFullYear();
    const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    if (req.user.isAdmin) {
        try {
            let data = await Video.aggregate([
                {
                    $project: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                },
                {
                    $match: {
                        year: year,
                    },
                },
                {
                    $group: {
                        _id: '$month',
                        year: { $first: '$year' },
                        total: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]);

            data = data.map((item) => {
                return {
                    ...item,
                    name: month[item._id - 1],
                };
            });

            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Invalid server' });
        }
    } else {
        res.status(403).json('You are not allowed');
    }
};

//update video
export const updateVideo = async (req, res) => {
    const id = req.params.id;
    try {
        if (req.user.isAdmin) {
            const video = await Video.findOneAndUpdate(
                { _id: id },
                { ...req.body },
                { new: true },
            );
            console.log(video);

            if (video) {
                res.json(video);
            } else {
                res.status(403).json({ success: false, message: 'Not found' });
            }
        } else {
            const video = await Video.findOneAndUpdate(
                { _id: id, user: req.user._id },
                { ...req.body },
                { new: true },
            );

            if (video) {
                res.json(video);
            } else {
                res.status(403).json({ success: false, message: 'Not found' });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Invalid server' });
    }
};
