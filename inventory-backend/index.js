const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`Kërkesë e re: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('BeexStorage Backend is Active!');
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: password,
        role: "Student"
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: "Ky përdorues ekziston tashmë!" });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (user && user.password === password) {
      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username, role: user.role } 
      });
    } else {
      res.status(401).json({ success: false, message: "Username ose password gabim" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Gabim në server" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at port ${PORT}`);
});