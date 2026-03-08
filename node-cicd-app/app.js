const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

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
  const posts = await Post.find().populate('author'); // populate traz os dados do user
  res.send(posts);
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

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

module.exports = app;

const server = app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM. Fechando servidor suavemente...');
  server.close(() => {
    console.log('Servidor fechado.');
    mongoose.connection.close(false, () => {
      console.log('Conexão MongoDB fechada.');
      process.exit(0);
    });
  });
});