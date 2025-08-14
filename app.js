require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const UserRouter = require('./routes/user');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
app.use(express.static(path.resolve('./public')));
const Blog = require('./models/blog'); // Assuming you have a Blog model


mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});


app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.get('/', async (req, res) => {
//   res.send('Hello, World!');
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 }).populate('createdBy', 'fullName profileImageURL');
  console.log('User:', req.user);
  console.log('All Blogs:', allBlogs);
  res.render('home', { title: 'HomePage','user': req.user, allBlogs });
});
app.use('/user', UserRouter);
app.use('/blog', require('./routes/blog'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});