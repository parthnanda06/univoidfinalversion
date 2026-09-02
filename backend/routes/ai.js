const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const prisma = require('../prismaClient');

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const formatDoc = (doc) => {
  if (!doc) return doc;
  return { ...doc, _id: doc.id };
};

// @route   GET /api/ai/sessions
// @desc    Get all AI chat sessions for a user
// @access  Private
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await prisma.aIChat.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, isPinned: true, updatedAt: true, createdAt: true }
    });
    res.json(sessions.map(formatDoc));
  } catch (error) {
    console.error('Get AI sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ai/sessions/:id
// @desc    Get a specific AI chat session
// @access  Private
router.get('/sessions/:id', protect, async (req, res) => {
  try {
    const chat = await prisma.aIChat.findUnique({
      where: { id: req.params.id }
    });
    
    if (!chat || chat.userId !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(formatDoc(chat));
  } catch (error) {
    console.error('Get AI session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ai/ask
// @desc    Ask AI Study Buddy and save to a session
// @access  Private
router.post('/ask', protect, async (req, res) => {
  const { prompt, sessionId } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    let chat;
    let historyMessages = [];

    // 1. Find existing session or create new one
    if (sessionId) {
      chat = await prisma.aIChat.findUnique({ where: { id: sessionId } });
      if (!chat || chat.userId !== req.user.id) {
        return res.status(404).json({ message: 'Chat session not found' });
      }
      if (chat.messages && Array.isArray(chat.messages)) {
        historyMessages = chat.messages;
      }
    } else {
      // Create a new session. Generate a title from the prompt.
      const title = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
      chat = await prisma.aIChat.create({
        data: { 
          userId: req.user.id, 
          title: title,
          messages: [] 
        }
      });
    }

    // 2. Prepare messages for Groq (limit history for context window)
    const contextMessages = historyMessages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const messages = [
      {
        role: 'system',
        content: 'You are AI Study Buddy, a helpful and knowledgeable assistant for UniVoid, a student ecosystem platform. You help students with their academic doubts, coding problems, and career advice. Keep your responses concise, accurate, and encouraging.',
      },
      ...contextMessages,
      {
        role: 'user',
        content: prompt,
      },
    ];

    // 3. Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'groq/compound',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    // 4. Save both messages to DB
    historyMessages.push({ role: 'user', content: prompt });
    historyMessages.push({ role: 'assistant', content: responseText });
    
    // 5. Generate smart title on 2nd user message
    let finalTitle = chat.title;
    const userMessageCount = historyMessages.filter(m => m.role === 'user').length;
    
    if (userMessageCount === 2) {
      try {
        const titleCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'Generate a short 3-5 word title for a conversation that starts with these messages. Return ONLY the title text without quotes.' },
            { role: 'user', content: `User: ${historyMessages[0].content}\nAI: ${historyMessages[1].content}\nUser: ${historyMessages[2].content}` }
          ],
          model: 'groq/compound',
          temperature: 0.5,
          max_tokens: 30,
        });
        const generatedTitle = titleCompletion.choices[0]?.message?.content?.replace(/["']/g, '').trim();
        if (generatedTitle) finalTitle = generatedTitle;
      } catch (e) {
        console.error('Title generation failed:', e);
      }
    }

    await prisma.aIChat.update({
      where: { id: chat.id },
      data: { messages: historyMessages, title: finalTitle }
    });

    res.json({ response: responseText, sessionId: chat.id, title: finalTitle });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ message: 'AI Study Buddy is currently resting. Please try again later.' });
  }
});

// @route   DELETE /api/ai/sessions/:id
// @desc    Delete a specific AI chat session
// @access  Private
router.delete('/sessions/:id', protect, async (req, res) => {
  try {
    const chat = await prisma.aIChat.findUnique({ where: { id: req.params.id } });
    if (!chat || chat.userId !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    await prisma.aIChat.delete({ where: { id: req.params.id } });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete AI session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/ai/sessions/:id
// @desc    Update a specific AI chat session (rename or pin)
// @access  Private
router.put('/sessions/:id', protect, async (req, res) => {
  try {
    const { title, isPinned } = req.body;
    
    const chat = await prisma.aIChat.findUnique({ where: { id: req.params.id } });
    if (!chat || chat.userId !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (isPinned !== undefined) data.isPinned = isPinned;

    const updatedChat = await prisma.aIChat.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(formatDoc(updatedChat));
  } catch (error) {
    console.error('Update AI session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
