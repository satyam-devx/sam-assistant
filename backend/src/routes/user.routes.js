const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get or create default user
router.get('/me', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Student' }
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user name
router.put('/me', async (req, res) => {
  try {
    const { name } = req.body;
    let user = await prisma.user.findFirst();
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
