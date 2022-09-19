import mongoose from 'mongoose'
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    content: {
        type: String,
        required: true
    },
    likesCount : {
        type: Number,
        default: 0,
    },
    video : {
        type: Schema.Types.ObjectId,
        ref: 'videos'
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model('comments', CommentSchema)