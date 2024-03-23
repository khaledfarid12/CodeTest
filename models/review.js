

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    rating: Number,
    comment: String,
    username: String,
}, 
{ 
    timestamps: true 
}

);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
