import express from 'express'

import {login, register, verify} from '../controllers/AuthController.js'
import virifyToken from '../midlewares/auth.js'

const router = express.Router()



router.post('/register', register)
router.post('/login', login)
router.get('/', virifyToken,  verify)
router.get('/:slug', (req, res) => {
    console.log(req.params);
})


export default router