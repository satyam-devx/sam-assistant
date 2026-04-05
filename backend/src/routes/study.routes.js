const express = require('express');
const router  = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const getUser = async () => {
  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { name: 'Student' } });
  return user;
};

// ─── FLASHCARDS ───────────────────────────────────────────

// Get all flashcards
router.get('/flashcards', async (req, res) => {
  try {
    const user  = await getUser();
    const cards = await prisma.flashcard.findMany({
      where:   { userId: user.id },
      orderBy: { nextReview: 'asc' }
    });
    res.json(cards);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create flashcard manually
router.post('/flashcards', async (req, res) => {
  try {
    const user = await getUser();
    const { question, answer, subject } = req.body;
    const card = await prisma.flashcard.create({
      data: { question, answer, subject, userId: user.id }
    });
    res.json(card);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI generate flashcards from topic
router.post('/flashcards/generate', async (req, res) => {
  try {
    const user = await getUser();
    const { topic, count = 5 } = req.body;

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role:    'user',
        content: `Generate ${count} flashcards for the topic: "${topic}".
Return ONLY a JSON array like this (no extra text):
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`
      }]
    });

    const text  = response.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const cards = JSON.parse(clean);

    const saved = await Promise.all(
      cards.map(c => prisma.flashcard.create({
        data: { question: c.question, answer: c.answer, subject: topic, userId: user.id }
      }))
    );

    res.json(saved);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Review flashcard (spaced repetition — easy/hard)
router.put('/flashcards/:id/review', async (req, res) => {
  try {
    const { quality } = req.body; // 0=hard, 1=medium, 2=easy
    const card = await prisma.flashcard.findUnique({ where: { id: req.params.id } });

    // Simple SM-2 algorithm
    let { easeFactor, interval } = card;
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (2 - quality) * 0.18);
    interval   = quality < 1 ? 1 : Math.round(interval * easeFactor);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const updated = await prisma.flashcard.update({
      where: { id: req.params.id },
      data:  { easeFactor, interval, nextReview }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete flashcard
router.delete('/flashcards/:id', async (req, res) => {
  try {
    await prisma.flashcard.delete({ where: { id: req.params.id } });
    res.json({ message: 'Flashcard deleted ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── STUDY SESSIONS ───────────────────────────────────────

// Start/save a study session
router.post('/sessions', async (req, res) => {
  try {
    const user = await getUser();
    const { subject, duration, notes } = req.body;
    const session = await prisma.studySession.create({
      data: { subject, duration, notes, userId: user.id }
    });
    res.json(session);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all sessions
router.get('/sessions', async (req, res) => {
  try {
    const user     = await getUser();
    const sessions = await prisma.studySession.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take:    20
    });
    res.json(sessions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── QUIZ ─────────────────────────────────────────────────

router.post('/quiz', async (req, res) => {
  try {
    const { topic, numQuestions = 3 } = req.body;

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role:    'user',
        content: `Generate ${numQuestions} MCQ quiz questions about "${topic}".
Return ONLY a JSON array (no extra text):
[
  {
    "question": "...",
    "options":  ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer":   "A"
  }
]`
      }]
    });

    const text  = response.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const quiz  = JSON.parse(clean);
    res.json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
