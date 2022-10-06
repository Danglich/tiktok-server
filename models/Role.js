import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    _id: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
        enum: ['ADMIN', 'USER'],
        default: 'USER',
    },
});

export default mongoose.model('role', RoleSchema);
