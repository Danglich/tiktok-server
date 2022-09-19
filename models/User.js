import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg'
    },
    bio: {
        type: String,
        default: null
    },
    followings:[{
            type: Schema.Types.ObjectId,
            ref: 'user',
            default: []
        }]
    ,
    followers : [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: []
    }],
    likes: {
        type: Number,
        default: 0
    },
    webUrl: {
        type:String,
        default: null

    },
    facebookUrl: {
        type:String,
        default: null
        
    },
    youtubeUrl: {
        type:String,
        default: null
        
    },
    videosLiked : [{
        type: Schema.Types.ObjectId,
        ref: 'videos',
        default: null
    }],
    roleId: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})


export default mongoose.model('user', UserSchema)