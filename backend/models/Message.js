const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  });
  
  const Message = mongoose.model('Message', messageSchema);
  
  // Send a message
  app.post('/api/message', checkJwt, async (req, res) => {
    const { receiverId, content } = req.body;
  
    try {
      const message = new Message({
        sender: req.user._id,
        receiver: receiverId,
        content,
      });
  
      await message.save();
      res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ message: 'Error sending message' });
    }
  });
  
  // Get all messages for a user
  app.get('/api/messages', checkJwt, async (req, res) => {
    try {
      const messages = await Message.find({ receiver: req.user._id }).populate('sender');
      res.status(200).json({ success: true, messages });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });
  