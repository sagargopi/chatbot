const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Knowledge base for the chatbot
const knowledgeBase = {
  greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
  farewells: ['bye', 'goodbye', 'see you', 'take care'],
  gratitude: ['thanks', 'thank you', 'appreciate it'],
  questions: {
    what: ['what', 'explain', 'tell me about', 'describe'],
    how: ['how', 'way to', 'process of'],
    who: ['who'],
    when: ['when', 'time', 'schedule'],
    where: ['where', 'location', 'place'],
  },
  topics: {
    programming: ['javascript', 'python', 'java', 'coding', 'programming', 'developer', 'software'],
    database: ['database', 'mysql', 'sql', 'data', 'storage'],
    web: ['website', 'web development', 'frontend', 'backend', 'full stack'],
    ai: ['artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning'],
  }
};

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'chatbot_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Helper function to detect question type
function detectQuestionType(message) {
  const words = message.toLowerCase().split(' ');
  for (const [type, patterns] of Object.entries(knowledgeBase.questions)) {
    if (patterns.some(pattern => words.some(word => word.startsWith(pattern)))) {
      return type;
    }
  }
  return null;
}

// Helper function to detect topic
function detectTopic(message) {
  const lowerMessage = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(knowledgeBase.topics)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return topic;
    }
  }
  return null;
}

// Helper function to get last few messages for context
async function getConversationContext(chatId, limit = 3) {
  const [results] = await db.promise().query(
    'SELECT content, sender FROM messages WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?',
    [chatId, limit]
  );
  return results.reverse();
}

// Enhanced bot response generation
async function generateBotResponse(message, chatId) {
  const lowerMessage = message.toLowerCase();
  const context = await getConversationContext(chatId);
  
  // Check for greetings
  if (knowledgeBase.greetings.some(greeting => lowerMessage.includes(greeting))) {
    const timeOfDay = new Date().getHours();
    let greeting = 'Hello';
    if (timeOfDay < 12) greeting = 'Good morning';
    else if (timeOfDay < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    return `${greeting}! How can I assist you today? Feel free to ask me about programming, databases, web development, or AI!`;
  }

  // Check for farewells
  if (knowledgeBase.farewells.some(farewell => lowerMessage.includes(farewell))) {
    return "Goodbye! If you have more questions later, don't hesitate to ask. Have a great day!";
  }

  // Check for gratitude
  if (knowledgeBase.gratitude.some(thanks => lowerMessage.includes(thanks))) {
    return "You're welcome! Is there anything else you'd like to know?";
  }

  // Handle programming questions
  if (lowerMessage.includes('programming') || lowerMessage.includes('coding')) {
    if (lowerMessage.includes('learn')) {
      return "To start learning programming, I recommend:\n1. Choose a language (Python is great for beginners)\n2. Use online resources like freeCodeCamp or Codecademy\n3. Practice with small projects\n4. Join coding communities\n\nWould you like specific resources for any programming language?";
    }
    if (lowerMessage.includes('language')) {
      return "Popular programming languages include:\n• Python - Great for beginners, AI, and data science\n• JavaScript - Essential for web development\n• Java - Popular for enterprise applications\n• C++ - Used in game development and system programming\n\nWhich one interests you the most?";
    }
  }

  // Handle database questions
  if (lowerMessage.includes('database') || lowerMessage.includes('mysql')) {
    if (lowerMessage.includes('what')) {
      return "A database is a structured collection of data. MySQL, which we're using in this chatbot, is a popular open-source relational database. Would you like to know more about database types or specific MySQL commands?";
    }
    if (lowerMessage.includes('how')) {
      return "To work with MySQL databases:\n1. Install MySQL Server\n2. Use MySQL Workbench or command line\n3. Learn basic SQL commands (SELECT, INSERT, UPDATE, DELETE)\n4. Practice database design\n\nWould you like a specific example?";
    }
  }

  // Handle web development questions
  if (lowerMessage.includes('web') || lowerMessage.includes('website')) {
    if (lowerMessage.includes('frontend')) {
      return "Frontend development involves:\n• HTML - Structure\n• CSS - Styling\n• JavaScript - Interactivity\n• Frameworks like React (what we're using!)\n\nWould you like to know more about any of these technologies?";
    }
    if (lowerMessage.includes('backend')) {
      return "Backend development includes:\n• Server (Node.js, Python, Java)\n• Databases (MySQL, MongoDB)\n• APIs\n• Server management\n\nI can provide more details about any of these aspects!";
    }
  }

  // Handle AI/ML questions
  if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
    return "Artificial Intelligence is a broad field that includes:\n• Machine Learning\n• Natural Language Processing\n• Computer Vision\n• Neural Networks\n\nI'm a chatbot using pattern matching to understand and respond to your questions. Would you like to learn more about any specific AI topic?";
  }

  // Handle general questions based on type
  const questionType = detectQuestionType(message);
  const topic = detectTopic(message);

  if (questionType && topic) {
    return generateTopicalResponse(questionType, topic);
  }

  // If no specific pattern is matched, provide a generic response with context
  return `I understand you're asking about "${message}". To help you better, could you:\n1. Be more specific about what you'd like to know?\n2. Mention the topic area (programming, databases, web, AI)?\n3. Or ask "help" to see all available topics!`;
}

function generateTopicalResponse(questionType, topic) {
  const responses = {
    programming: {
      what: "Programming is the process of creating computer software. It involves writing code in languages like Python, JavaScript, or Java. Would you like to know more about any specific language?",
      how: "To start programming:\n1. Choose a language\n2. Learn the basics (variables, loops, functions)\n3. Practice with small projects\n4. Use online resources and tutorials\n\nWould you like specific recommendations?",
      who: "Programmers, developers, and software engineers are professionals who write code. They work in various fields like web development, mobile apps, AI, and more.",
      when: "You can start programming at any time! Many successful developers started as self-taught programmers. The best time to start is now!",
      where: "You can learn programming:\n• Online platforms (Codecademy, freeCodeCamp)\n• Universities\n• Coding bootcamps\n• Self-study with documentation\n\nWould you like links to resources?"
    },
    database: {
      what: "A database is a structured way to store and organize data. Common types include:\n• Relational (MySQL, PostgreSQL)\n• NoSQL (MongoDB, Redis)\n• Graph databases (Neo4j)\n\nWould you like to know more about any specific type?",
      how: "To work with databases:\n1. Choose a database type\n2. Learn SQL for relational databases\n3. Understand data modeling\n4. Practice with sample datasets\n\nNeed more specific guidance?",
      who: "Database administrators (DBAs) and developers work with databases. They design, maintain, and optimize database systems.",
      when: "Databases are used whenever you need to store and manage structured data systematically.",
      where: "You can set up databases:\n• Locally on your computer\n• On cloud platforms (AWS, Azure)\n• Using managed services\n\nWould you like to know more about any of these options?"
    },
    web: {
      what: "Web development is creating websites and web applications. It includes:\n• Frontend (what users see)\n• Backend (server-side logic)\n• Databases\n• APIs\n\nWhich aspect interests you?",
      how: "To become a web developer:\n1. Learn HTML, CSS, JavaScript\n2. Choose frontend or backend focus\n3. Learn frameworks (React, Node.js)\n4. Build projects\n\nWant more specific guidance?",
      who: "Web developers can be:\n• Frontend developers\n• Backend developers\n• Full-stack developers\n• UI/UX designers\n\nWould you like to know more about any role?",
      when: "Web development is a constantly evolving field. The best time to start learning is now!",
      where: "You can learn web development:\n• Online platforms\n• Bootcamps\n• Universities\n• Self-study\n\nWould you like specific resource recommendations?"
    },
    ai: {
      what: "AI (Artificial Intelligence) is making computers perform tasks that typically require human intelligence. Key areas include:\n• Machine Learning\n• Natural Language Processing\n• Computer Vision\n\nWant to know more about any area?",
      how: "To get started with AI:\n1. Learn Python\n2. Study mathematics and statistics\n3. Learn ML frameworks\n4. Practice with datasets\n\nNeed more specific guidance?",
      who: "AI professionals include:\n• ML Engineers\n• Data Scientists\n• AI Researchers\n• NLP Engineers\n\nInterested in any particular role?",
      when: "AI is rapidly evolving. Many companies are actively implementing AI solutions now.",
      where: "You can learn AI:\n• Online courses (Coursera, edX)\n• Universities\n• Research institutions\n• Self-study resources\n\nWould you like specific recommendations?"
    }
  };

  return responses[topic]?.[questionType] || 
         `I understand you're asking ${questionType} about ${topic}. Could you please be more specific?`;
}

// Routes for chat management
app.post('/api/chats', async (req, res) => {
  const { name } = req.body;
  try {
    const query = 'INSERT INTO chats (name) VALUES (?)';
    const [result] = await db.promise().query(query, [name]);
    res.json({ 
      success: true, 
      chatId: result.insertId,
      name: name
    });
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Error creating chat' });
  }
});

app.get('/api/chats', async (req, res) => {
  try {
    const query = 'SELECT * FROM chats ORDER BY created_at DESC';
    const [results] = await db.promise().query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

app.delete('/api/chats/:chatId', async (req, res) => {
  const { chatId } = req.params;
  try {
    await db.promise().query('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    await db.promise().query('DELETE FROM chats WHERE id = ?', [chatId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'Error deleting chat' });
  }
});

// Message routes
app.post('/api/messages', async (req, res) => {
  const { message, chatId } = req.body;
  
  try {
    // Store user message
    const userQuery = 'INSERT INTO messages (chat_id, content, sender) VALUES (?, ?, ?)';
    const [userResult] = await db.promise().query(userQuery, [chatId, message, 'user']);
    
    // Generate and store bot response
    const botResponse = await generateBotResponse(message, chatId);
    const botQuery = 'INSERT INTO messages (chat_id, content, sender) VALUES (?, ?, ?)';
    const [botResult] = await db.promise().query(botQuery, [chatId, botResponse, 'bot']);
    
    res.json({ 
      success: true, 
      userMessageId: userResult.insertId,
      botMessageId: botResult.insertId,
      botResponse 
    });
  } catch (err) {
    console.error('Error handling message:', err);
    res.status(500).json({ error: 'Error processing message' });
  }
});

app.get('/api/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;
  try {
    const query = 'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp DESC LIMIT 50';
    const [results] = await db.promise().query(query, [chatId]);
    res.json(results.reverse());
  } catch (err) {
    console.error('Error retrieving messages:', err);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
