const asyncHandler = require('express-async-handler');
const ChatSession = require('../models/ChatSession');

// @desc    Create or get an existing active chat session for a user
// @route   POST /api/chat-sessions
// @access  Private
const createChatSession = asyncHandler(async (req, res) => {
  // Check if user already has an active session
  let session = await ChatSession.findOne({
    user: req.user._id,
    status: { $in: ['bot', 'waiting', 'active'] }
  });

  if (session) {
    return res.json(session);
  }

  session = new ChatSession({
    user: req.user._id,
    status: 'bot',
    messages: [],
  });

  const created = await session.save();
  res.status(201).json(created);
});

// @desc    Request human takeover (escalate from bot to waiting)
// @route   PUT /api/chat-sessions/:id/escalate
// @access  Private
const escalateToHuman = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id);

  if (session) {
    session.status = 'waiting';
    const updated = await session.save();

    // Notify support room via socket
    try {
      const emitter = req.io || global.io;
      if (emitter) emitter.to('support').emit('newChatEscalation', updated);
    } catch (e) {
      console.error('Socket emit error:', e.message);
    }

    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Chat session not found');
  }
});

// @desc    Agent claims a chat session
// @route   PUT /api/chat-sessions/:id/claim
// @access  Private/Support/Admin
const claimChatSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id);

  if (session) {
    session.assignedAgent = req.user._id;
    session.status = 'active';
    const updated = await session.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Chat session not found');
  }
});

// @desc    Add message to chat session
// @route   POST /api/chat-sessions/:id/messages
// @access  Private
const addChatMessage = asyncHandler(async (req, res) => {
  const { content, senderType } = req.body;
  const session = await ChatSession.findById(req.params.id);

  if (session) {
    const message = {
      sender: senderType || 'user',
      senderId: req.user._id,
      content,
    };

    session.messages.push(message);
    await session.save();

    // Emit message in real-time
    try {
      const emitter = req.io || global.io;
      if (emitter) {
        emitter.to(`chat_${session._id}`).emit('newChatMessage', {
          sessionId: session._id,
          message,
        });
      }
    } catch (e) {
      console.error('Socket emit error:', e.message);
    }

    res.status(201).json(session);
  } else {
    res.status(404);
    throw new Error('Chat session not found');
  }
});

// @desc    Close a chat session
// @route   PUT /api/chat-sessions/:id/close
// @access  Private/Support/Admin
const closeChatSession = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id);

  if (session) {
    session.status = 'closed';
    const updated = await session.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Chat session not found');
  }
});

// @desc    Get all chat sessions (for support agents)
// @route   GET /api/chat-sessions
// @access  Private/Support/Admin
const getChatSessions = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({
    status: { $in: ['waiting', 'active'] }
  })
    .populate('user', 'name email')
    .populate('assignedAgent', 'name')
    .sort({ updatedAt: -1 });

  res.json(sessions);
});

// @desc    Get chat session by ID
// @route   GET /api/chat-sessions/:id
// @access  Private
const getChatSessionById = asyncHandler(async (req, res) => {
  const session = await ChatSession.findById(req.params.id)
    .populate('user', 'name email')
    .populate('assignedAgent', 'name')
    .populate('messages.senderId', 'name role');

  if (session) {
    res.json(session);
  } else {
    res.status(404);
    throw new Error('Chat session not found');
  }
});

// @desc    Get chat history (closed sessions)
// @route   GET /api/chat-sessions/history
// @access  Private/Support/Admin
const getChatHistory = asyncHandler(async (req, res) => {
  const sessions = await ChatSession.find({ status: 'closed' })
    .populate('user', 'name email')
    .populate('assignedAgent', 'name')
    .sort({ updatedAt: -1 })
    .limit(50);

  res.json(sessions);
});

module.exports = {
  createChatSession,
  escalateToHuman,
  claimChatSession,
  addChatMessage,
  closeChatSession,
  getChatSessions,
  getChatSessionById,
  getChatHistory,
};
