import express from 'express';
const router = express.Router();

import virifyToken from '../midlewares/auth.js';
import {
    create,
    getVideosForYou,
    getVideosOfUser,
    getVideoFollowing,
    like,
    getVideoLiked,
    getVideoById,
    getVideoSuggest,
    deleteVideo,
    getAllVideos,
    getStats,
    updateVideo,
} from '../controllers/VideoController.js';

//Create Video
router.post('/', virifyToken, create);
router.get('/foryou', getVideosForYou);
router.get('/following', virifyToken, getVideoFollowing);
router.get('/uploaded/:nickname', getVideosOfUser);
router.put('/like/:videoId', virifyToken, like);
router.get('/liked', virifyToken, getVideoLiked);
router.post('/:videoId', getVideoById);
router.post('/delete/:videoId', virifyToken, deleteVideo);
router.get('/suggest', getVideoSuggest);

//Admin
router.get('/all', virifyToken, getAllVideos);
router.get('/stats', virifyToken, getStats);
router.put('/update/:id', virifyToken, updateVideo);

export default router;
