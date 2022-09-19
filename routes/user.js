import express from 'express';
import { checkNickname, editProfile, follow, getUserById, getUserFollowings, getUserSuggest } from '../controllers/UserController.js';
import virifyToken from '../midlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

//
router.get('/suggest', getUserSuggest);

//Follow or Unfollow
router.put('/:nickname', virifyToken, follow);

//Get followings
router.get('/followings', virifyToken, getUserFollowings);
router.get('/:userId', getUserById)
router.post('/update', virifyToken, editProfile);
router.post('/check', virifyToken, checkNickname);

export default router