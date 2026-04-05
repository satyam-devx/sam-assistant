const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();

const getUser = async () => {
  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { name: 'Student' } });
  return user;
};

router.get('/', async (req, res) => {
  try {
    const user  = await getUser();
    const tasks = await prisma.task.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const user = await getUser();
    const { title, description, priority, dueDate } = req.body;
    const task = await prisma.task.create({
      data: { title, description, priority: priority || 'medium', dueDate: dueDate ? new Date(dueDate) : null, userId: user.id }
    });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data:  req.body
    });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
