const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const vision = require('@google-cloud/vision');

const app = express();

// Create a client for Google Cloud Vision API
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'google-cloud-key.json')
});

// Configure multer to save files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storage });

app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing image:', req.file.path);
    console.log('File size:', fs.statSync(req.file.path).size, 'bytes');
    
    // Read the image file
    const imageContent = await fs.promises.readFile(req.file.path);
    
    // Perform text detection with Google Cloud Vision API
    const [result] = await client.textDetection({
      image: { content: imageContent },
      imageContext: {
        languageHints: ['ja']
      }
    });

    console.log(result.textAnnotations);

    console.log(fullTextAnnotation.description);

    // Rest of the annotations are individual text blocks
    const blocks = textAnnotations.slice(1).map(annotation => ({
      text: annotation.description,
      confidence: annotation.confidence || 0,
      boundingBox: {
        vertices: annotation.boundingPoly?.vertices || []
      }
    }));

    // Function to check if text is Japanese (contains Japanese characters)
    const   containsJapanese = (text) => {
      return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(text);
    };

    // Function to calculate text block size
    const getTextBlockSize = (block) => {
      if (!block.boundingBox?.vertices || block.boundingBox.vertices.length < 4) {
        return 0;
      }
      const width = Math.abs(block.boundingBox.vertices[1].x - block.boundingBox.vertices[0].x);
      const height = Math.abs(block.boundingBox.vertices[2].y - block.boundingBox.vertices[1].y);
      return width * height;
    };

    // Filter blocks based on language and size
    const filteredBlocks = blocks.filter(block => {
      if (!block.boundingBox?.vertices || block.boundingBox.vertices.length < 4) {
        return false;
      }
      const isJapanese = containsJapanese(block.text);
      const blockSize = getTextBlockSize(block);
      const minSize = 1000; // Adjust this threshold as needed
      return isJapanese && blockSize > minSize;
    });

    console.log(textAnnotations)

    // Calculate average confidence from blocks
    const totalConfidence = blocks.reduce((sum, block) => sum + (block.confidence || 0), 0);
    const averageConfidence = blocks.length > 0 ? (totalConfidence / blocks.length) * 100 : 0;

    const imageUrl = `/uploads/${path.basename(req.file.path)}`;
    res.json({
      text: fullTextAnnotation.description || '',
      confidence: averageConfidence,
      filteredBlocks,
      imageUrl,
      imageWidth,
      imageHeight
    });

    await fs.promises.unlink(req.file.path);

  } catch (error) {
    console.error('Processing Error:', error);
    // Clean up the file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete temporary file after error:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Image processing failed: ' + error.message });
  }
});

// Cleanup on server shutdown
process.on('SIGINT', async () => {
  // Clean up any remaining files in uploads directory
  const uploadDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadDir)) {
    const files = await fs.promises.readdir(uploadDir);
    for (const file of files) {
      await fs.promises.unlink(path.join(uploadDir, file));
    }
  }
  process.exit();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 