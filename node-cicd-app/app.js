const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error"
  });
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb-service:27017/blog';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Conectado ao banco: blog'))
  .catch(err => console.error('Erro ao conectar no Mongo:', err));

// --- MODELS ---

const User = mongoose.model('User', { 
  name: String, 
  email: String 
});

const Post = mongoose.model('Post', {
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', {
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now }
});

// COMMENT
app.post('/comments', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();

    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao criar comentário' });
  }
});

app.get('/comments', async (req, res) => {
  const comments = await Comment
    .find()
    .populate('author')
    .populate('post');

  res.send(comments);
});

app.get('/posts/:postId/comments', async (req, res) => {

  const comments = await Comment
    .find({ post: req.params.postId })
    .populate('author');

  res.send(comments);
});

app.get('/comments/:id', async (req, res) => {

  const comment = await Comment
    .findById(req.params.id)
    .populate('author')
    .populate('post');

  if (!comment) {
    return res.status(404).send();
  }

  res.send(comment);
});

app.put('/comments/:id', async (req, res) => {

  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!comment) {
    return res.status(404).send();
  }

  res.send(comment);
});

app.delete('/comments/:id', async (req, res) => {

  await Comment.findByIdAndDelete(req.params.id);

  res.send({ message: "Comentário removido com sucesso" });
});

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).send(user);
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});


app.post('/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).send(post);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao criar post' });
  }
});

app.get('/posts', async (req, res) => {

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10

  const posts = await Post
    .find()
    .populate('author')
    .skip((page - 1) * limit)
    .limit(limit)

  res.send(posts)
});

app.get('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author');
  if (!post) return res.status(404).send();
  res.send(post);
});

app.put('/posts/:id', async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(post);
});

app.delete('/posts/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.send({ message: 'Post removido com sucesso' });
});

app.get("/health", async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      return res.status(200).json({
        status: "UP",
        database: "Connected",
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error("Database not connected");
    }
  } catch (error) {
    return res.status(503).json({
      status: "DOWN",
      reason: error.message
    });
  }
});

app.get('/', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { 
      routes.push({
        method: Object.keys(middleware.route.methods).join(', ').toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') { 
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            method: Object.keys(handler.route.methods).join(', ').toUpperCase(),
            path: handler.route.path
          });
        }
      });
    }
  });

  res.json(routes);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

module.exports = app;
