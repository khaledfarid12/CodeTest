

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Post = require('../models/post');
const reviews = require('../models/review');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/timeline', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());




//First  API to add a post
app.post('/posts', async (req, res) => {
    try {
        const { title, body, username } = req.body;
        const post = new Post({ title, body, username });
        await post.save();
        res.json({ success: true, message: 'Post added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add post' });
    }
});

//   Second  API to list user posts with pagination
app.get('/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { page, limit } = req.query;
        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        };
        const userPosts = await Post.paginate({ username }, options);
        res.json(userPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch user posts' });
    }
});

// Third  API to list top posts with pagination
app.get('/posts/top', async (req, res) => {
    try {
        const { page, limit } = req.query;
        const options = {
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        };
        const topPosts = await Post.aggregate([
            { $addFields: { avgRating: { $avg: '$ratings.rating' } } },
            { $sort: { avgRating: -1 } },
            { $project: { ratings: 0 } },
        ]).limit(options.limit * 1).skip((options.page - 1) * options.limit);
        res.json(topPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch top posts' });
    }
});

//  Fourth API to add a review to a post
app.post('/posts/:postId/reviews', async (req, res) => {
    try {
        const { postId } = req.params;
        const { rating, comment, username } = req.body;
        const review = { rating, comment, username };
        await Post.findByIdAndUpdate(postId, { $push: { ratings: review } });
        res.json({ success: true, message: 'Review added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add review' });
    }
});

// fifth  API to add a review to Post
app.post('/:postId/reviews', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, rating, comment } = req.body;

        // Find the post by postId and add the review
        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId },
            { $push: { reviews: { userId, rating, comment } } },
            { new: true }
        );

        if (!updatedPost) {
           res.status(404).json({ success: false, message: 'Post not found' });
        } else {
            res.json({ success: true, message: 'Review added successfully', post: updatedPost });
        }

      
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to add review' });
    }
});

module.exports = router;




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
