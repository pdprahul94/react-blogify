const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog'); // Assuming you have a Blog model
const Comment = require('../models/comment'); // Assuming you have a Comment model

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve('./public/uploads/')); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original file name
    }
});

const upload = multer({ storage });


router.get('/add', (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    res.render('addBlog', { title: 'Add Blog', 'user': req.user});
});

router.get('/:id', async (req, res) => {
    try {
        const blogs = await Blog.findById(req.params.id).populate('createdBy');
        const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
        console.log('Blog:', blogs);
        res.render('blog', { title: 'Blogs', blogs, comments });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Internal Server Error');
    }
});



router.post('/add', upload.single('coverImage'), async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    const { title, body } = req.body;
    try {
        await Blog.create({ 
            title,
            body,
            coverImageURL : req.file ? `/uploads/${req.file.filename}` : null,
            createdBy: req.user._id
        });
        console.log('Blog added successfully');
        res.redirect('/blog/add');
    }catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/comment/:blogId', async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    const { comment } = req.body;
    try {
        const blog = await Blog.findById(req.params.blogId);

        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        await Comment.create({
            content: comment,
            blogId: req.params.blogId,
            createdBy: req.user._id
        });
        console.log('Comment added successfully');
        res.redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;