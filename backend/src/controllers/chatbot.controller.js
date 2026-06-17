const chatbotService = require('../services/chatbot.service');

exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) return res.status(400).json({ message: 'Message requis' });
    const reply = await chatbotService.sendMessage(req.user, message);
    res.json({ reply });
  } catch (e) { next(e); }
};
