//"start" : "nodemon --inspect index.js",
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRouter from './routes/auth.js';
import searchRouter from './routes/search.js';
import videosRouter from './routes/videos.js';
import userRouter from './routes/user.js';

dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tiktok.j1i1msi.mongodb.net/?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        );

        console.log('MongoDB connected !!!');
    } catch (error) {
        console.log('Connect to MongoDB failed: ' + error);
        process.exit(1);
    }
};

connectDB();

const app = express();
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});

app.use('/api/auth', authRouter);

//Search
app.use('/api/search', searchRouter);

//Videos
app.use('/api/videos', videosRouter);

//User
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log('listening on port ' + PORT);
});
