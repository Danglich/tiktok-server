import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    comment: {
        type: Number,
        enum: [0, 1],
        default: 1,
    },
    regime: {
        type: Number,
        enum: [1, 2, 3], //1 : Công khai, 2: Bạn bè, 3: Riêng tư
        default: 1,
    },
    title: {
        type: String,
        default: ' ',
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        default: 'active',
    },
    sharesCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model('videos', VideoSchema);
