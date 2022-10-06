import express from 'express';
import {
    checkNickname,
    deleteUser,
    editProfile,
    follow,
    getAllUser,
    getStats,
    getUserById,
    getUserFollowings,
    getUserSuggest,
    updateUser,
} from '../controllers/UserController.js';
import virifyToken from '../midlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

//
router.get('/suggest', getUserSuggest);

//Follow or Unfollow
router.put('/:nickname', virifyToken, follow);

//Get followings
router.get('/followings', virifyToken, getUserFollowings);

router.post('/update', virifyToken, editProfile);
router.post('/check', virifyToken, checkNickname);

// get all
router.get('/all', virifyToken, getAllUser);

router.get('/stats', virifyToken, getStats);

router.get('/:userId', getUserById);
router.delete('/:userId', virifyToken, deleteUser);

router.put('/update/:id', virifyToken, updateUser);

export default router;
