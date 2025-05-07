require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize model
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro-latest",
  systemInstruction: "You are a helpful coding assistant that generates clean, responsive website code. Always respond with HTML first, then CSS, then JavaScript in sequence.",
  generationConfig: {
    maxOutputTokens: 4000,
    temperature: 0.5
  }
});

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// Multer setup
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    mimetype && extname ? cb(null, true) : cb('Error: File type not supported!');
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const CODE_PROMPT_TEMPLATE = (text) => `
Create a responsive website based on:
${text}

Respond with this exact format:

=== HTML ===
[full HTML code here]

=== CSS ===
[full CSS code here]

=== JavaScript ===
[full JavaScript code here]

Requirements:
1. Semantic HTML5 structure
2. Modern CSS (Flexbox/Grid)
3. Mobile-first approach
4. Clean, well-commented code
5. All code must be in sequence (no side-by-side code)
`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image required' });
    }

    const prompt = {
      role: "user",
      parts: []
    };

    if (message) prompt.parts.push({ text: message });
    if (image) {
      prompt.parts.push({
        inlineData: {
          data: image.split(',')[1],
          mimeType: image.split(';')[0].split(':')[1]
        }
      });
    }

    const result = await model.generateContent({ contents: [prompt] });
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'AI service error',
      details: error.message.includes('404') 
        ? 'Invalid model name or API version' 
        : error.message
    });
  }
});

// Image processing endpoint
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // 1. First try direct image analysis with Gemini
    try {
      const imageBase64 = fs.readFileSync(req.file.path).toString('base64');
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: "Generate complete website code from this image. Provide HTML first, then CSS, then JavaScript in sequence." },
            {
              inlineData: {
                data: imageBase64,
                mimeType: req.file.mimetype
              }
            }
          ]
        }]
      });

      const response = await result.response;
      return res.json({
        imageUrl: `/uploads/${req.file.filename}`,
        code: response.text(),
        steps: ["1. Implement the HTML code", "2. Add the CSS styles", "3. Include the JavaScript"]
      });
    } catch (geminiError) {
      console.log('Direct image analysis failed, falling back to OCR');
    }

    // 2. Fallback to OCR if direct analysis fails
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'eng',
      { 
        logger: m => console.log(m),
        tessedit_pageseg_mode: 6
      }
    );

    const textResult = await model.generateContent(CODE_PROMPT_TEMPLATE(text));
    const textResponse = await textResult.response;
    
    res.json({
      imageUrl: `/uploads/${req.file.filename}`,
      code: textResponse.text(),
      steps: ["1. Review the HTML code", "2. Implement the CSS", "3. Add the JavaScript"]
    });

    // Clean up file
    fs.unlink(req.file.path, () => {});
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Image processing failed',
      details: error.message 
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(5001, () => console.log('Server running on port 5001'));