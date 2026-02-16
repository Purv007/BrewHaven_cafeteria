require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit'); // Rate limiting for production
const helmet = require('helmet'); // Security headers for production

const userModel = require('./models/Customer');
const productModel = require('./models/Product');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const cartModel = require('./models/Cart');
const Order = require('./models/Order');
const nodemailer = require('nodemailer');
const Customer = require('./models/Customer');
const Feedback = require('./models/Feedback');
const Wishlist = require('./models/Wishlist');
const bcrypt = require('bcryptjs');

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    // Check if user is admin using environment variable
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cafeteria.com';
    if (user.email !== adminEmail) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  });
}

const app = express();

// Security middleware for production
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Needed for image loading
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.mongodb.net"] // Allow MongoDB connections
    }
  }
}));

// Rate limiting DISABLED for development - removed to prevent request limits

app.use(express.json({ limit: '10mb' })); // Increase payload size limit for production
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration with dynamic origins based on environment
// Default origins for development
const defaultOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Parse additional origins from comma-separated environment variable
const additionalOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : [];

// Combine default and additional origins
const allowedOrigins = [...defaultOrigins, ...additionalOrigins];

// In production, only allow specific origins
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(pattern => {
        if (pattern.startsWith('https://*.')) {
          const domain = pattern.substring(9); // Remove 'https://*.'
          return origin.endsWith(domain);
        }
        return false;
      })) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  // Allow all origins in development
  app.use(cors({
    origin: true,
    credentials: true
  }));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images', { maxAge: '1d' })); // Cache images for 1 day
app.use('/api/images', express.static('images'));

// Static assets are served by React frontend from public folder

// Serve default avatar
app.get('/default-avatar.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'default-avatar.svg'));
});

// Image serving route
app.get('/images/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    const imagePath = path.join(__dirname, 'images', category, filename);
    console.log(`🔍 Requesting local image: ${imagePath}`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`✅ Local image found: ${imagePath}`);
      res.sendFile(imagePath);
    } else {
      console.log(`❌ Local image not found: ${imagePath}`);
      res.status(404).json({ 
        error: 'Image not found', 
        path: imagePath
      });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API image serving route
app.get('/api/images/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    const imagePath = path.join(__dirname, 'images', category, filename);
    console.log(`🔍 Requesting API local image: ${imagePath}`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`✅ API local image found: ${imagePath}`);
      res.sendFile(imagePath);
    } else {
      console.log(`❌ API local image not found: ${imagePath}`);
      res.status(404).json({ 
        error: 'Image not found', 
        path: imagePath
      });
    }
  } catch (error) {
    console.error('Error serving API image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a test route to verify the server is working
app.get('/test-images', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, 'images');
    const categories = fs.readdirSync(imagesDir);
    const imageList = {};
    
    categories.forEach(category => {
      const categoryPath = path.join(imagesDir, category);
      if (fs.statSync(categoryPath).isDirectory()) {
        imageList[category] = fs.readdirSync(categoryPath);
      }
    });
    
    res.json({ 
      message: 'Image directory structure',
      images: imageList,
      totalCategories: categories.length
    });
  } catch (error) {
    console.error('Error reading image directory:', error);
    res.status(500).json({ error: 'Failed to read image directory' });
  }
});

// JWT middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Add this to your server/index.js temporarily
app.get('/db-info', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    const collections = await db.listCollections().toArray();
    const userCount = await userModel.countDocuments();
    
    res.json({
      database: dbName,
      collections: collections.map(c => c.name),
      userCount: userCount,
      connectionStatus: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔌 MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI;

// Add connection options for production
const connectWithRetry = () => {  
  mongoose.connect(MONGODB_URI, { 
    serverSelectionTimeoutMS: 30000, // Increase timeout for server selection
    bufferCommands: false, // Disable mongoose buffering
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    setTimeout(connectWithRetry, 5000);
  });
};

// Ensure database indexes for better performance
const ensureIndexes = async () => {
  try {
    // Create indexes for frequently queried fields
    await userModel.createIndexes([
      { key: { email: 1 }, unique: true }
    ]);
    await productModel.createIndexes([
      { key: { category: 1 } }
    ]);
    await Order.createIndexes([
      { key: { userId: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ Database indexes ensured');
  } catch (err) {
    console.log('⚠️ Index creation warning:', err.message);
  }
};

connectWithRetry();

// Ensure indexes after connection
mongoose.connection.on('connected', () => {
  ensureIndexes();
});

// 🚀 Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ name, email, password: hashedPassword });

    // Generate JWT
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    // 🛠️ Updated Response to match frontend expectations
    return res.status(201).json({
      message: "Signup successful",
      username: newUser.name,
      userId: newUser._id,
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// 🔐 Signin Route
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has hashed password (new users) or plain password (old users)
    let isValidPassword = false;
    if (user.password.startsWith('$2')) {
      // Hashed password
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Plain password (for backward compatibility)
      isValidPassword = user.password === password;
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // ✅ Send proper data for frontend
    return res.status(200).json({
      username: user.name,
      userId: user._id,
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});



// 🛒 Get All Products (Menu Items)
app.get('/products', async (req, res) => {
  try {
    const products = await productModel.find();
    // Add ratingsCount to each product
    const productsWithCount = products.map(p => {
      const obj = p.toObject();
      obj.ratingsCount = p.ratings ? p.ratings.length : 0;
      return obj;
    });
    res.status(200).json(productsWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ⭐ Rate a Product (only for logged-in users)
app.post('/products/:id/rate', authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;
    const { rating } = req.body;
    if (!userId || typeof rating !== 'number') {
      return res.status(400).json({ error: 'userId and rating are required' });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Remove previous rating by this user if exists
    product.ratings = product.ratings.filter(r => r.userId.toString() !== userId);
    // Add new rating
    product.ratings.push({ userId, rating });
    // Recalculate average rating
    const avg = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;
    product.rating = Math.round(avg * 10) / 10;
    await product.save();
    res.status(200).json({ rating: product.rating, ratingsCount: product.ratings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to rate product' });
  }
});

// ❌ Remove a user's rating for a product
app.delete('/products/:id/rate', authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Remove the user's rating
    product.ratings = product.ratings.filter(r => r.userId.toString() !== userId);
    // Recalculate average rating
    if (product.ratings.length > 0) {
      const avg = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;
      product.rating = Math.round(avg * 10) / 10;
    } else {
      product.rating = 0;
    }
    await product.save();
    res.status(200).json({ rating: product.rating, ratingsCount: product.ratings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove rating' });
  }
});

// 💖 WISHLIST ROUTES

// Get user's wishlist
app.get('/wishlist', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const wishlist = await Wishlist.find({ userId }).populate('productId');
    res.status(200).json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
app.post('/wishlist', authenticateJWT, async (req, res) => {
  try { 
    const userId = req.user.userId;
    const { productId } = req.body;

    console.log('🔍 Wishlist POST request:', { userId, productId });

    if (!productId) {
      console.log('❌ No productId provided');
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✅ Product found:', product.name);

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({ userId, productId });
    if (existingWishlistItem) {
      console.log('❌ Product already in wishlist');
      return res.status(409).json({ error: 'Product already in wishlist' });
    }

    console.log('✅ Creating wishlist item...');
    const wishlistItem = await Wishlist.create({ userId, productId });
    const populatedItem = await Wishlist.findById(wishlistItem._id).populate('productId');
    
    console.log('✅ Wishlist item created successfully');
    res.status(201).json(populatedItem);
  } catch (err) {
    console.error('❌ Wishlist error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Product already in wishlist' });
    }
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist
app.delete('/wishlist/:productId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const deletedItem = await Wishlist.findOneAndDelete({ userId, productId });
    if (!deletedItem) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Check if product is in user's wishlist
app.get('/wishlist/check/:productId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({ userId, productId });
    res.status(200).json({ inWishlist: !!wishlistItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check wishlist status' });
  }
});

// Test endpoint to check if server is working
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const models = {
      Wishlist: !!Wishlist,
      Product: !!productModel,
      Customer: !!Customer,
      Cart: !!cartModel,
      Order: !!Order
    };
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      models: models,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test wishlist endpoint for debugging
app.get('/wishlist/test', async (req, res) => {
  try {
    console.log('🧪 Testing wishlist functionality...');
    
    // Test database connection
    const dbStatus = mongoose.connection.readyState;
    console.log('📊 Database status:', dbStatus);
    
    // Test Wishlist model
    if (!Wishlist) {
      throw new Error('Wishlist model not found');
    }
    console.log('✅ Wishlist model found');
    
    // Test basic operations
    const totalWishlists = await Wishlist.countDocuments();
    console.log('📊 Total wishlists in database:', totalWishlists);
    
    // Test schema
    const sampleWishlist = new Wishlist({
      userId: new mongoose.Types.ObjectId(),
      productId: new mongoose.Types.ObjectId()
    });
    console.log('✅ Wishlist schema validation passed');
    
    res.status(200).json({
      message: 'Wishlist test passed',
      databaseStatus: dbStatus,
      modelExists: !!Wishlist,
      totalWishlists: totalWishlists,
      schemaValid: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Wishlist test failed:', error);
    res.status(500).json({
      error: 'Wishlist test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Clear entire wishlist for a user
app.delete('/wishlist/clear', authenticateJWT, async (req, res) => {
  try {
    console.log('🔄 Wishlist clear endpoint called');
    const userId = req.user.userId;
    console.log('👤 User ID:', userId);
    
    // Check if Wishlist model exists
    if (!Wishlist) {
      console.error('❌ Wishlist model not found');
      return res.status(500).json({ error: 'Wishlist model not available' });
    }
    
    // Simple and fast approach
    console.log('🗑️ Attempting to delete wishlist items for user:', userId);
    const result = await Wishlist.deleteMany({ userId });
    console.log('✅ Delete result:', result);
    
    res.status(200).json({ 
      message: 'Wishlist cleared successfully', 
      deletedCount: result.deletedCount 
    });
    
  } catch (err) {
    console.error('❌ Error clearing wishlist:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to clear wishlist', 
      details: err.message 
    });
  }
});

// 🛒 Get current user's cart (removed duplicate - keeping the one at line 1684)

// 🛒 Bulk update current user's cart (for bulk operations)
app.post('/cart/bulk', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    if (items.length === 0) {
      // If items is empty, delete the cart document
      await cartModel.deleteOne({ userId });
      return res.status(200).json({ items: [] });
    }
    const cart = await cartModel.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Add connection options to handle timeouts and connection issues
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  socketTimeout: 30000, // 30 seconds
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000, // 30 seconds
  // Try alternative ports if 465 fails
  port: 587,
  secure: false, // Use STARTTLS instead of SSL
  requireTLS: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Place a new order
app.post('/orders', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, address, phone, paymentMethod, total, subtotal, discounts, gstAmount } = req.body;
    
    console.log('📨 Received order request:', { 
      userId, 
      itemsCount: items?.length, 
      address, 
      phone, 
      paymentMethod, 
      total, 
      subtotal, 
      discounts, 
      gstAmount 
    });
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item.' });
    }
    if (!address || !phone) {
      return res.status(400).json({ error: 'Address and phone are required.' });
    }
    
    // If this is a cash on delivery order, create it directly
    if (paymentMethod === 'cash') {
      console.log('🔄 Processing cash on delivery order...', { userId, items, address, phone, total, subtotal, discounts, gstAmount });
      
      // Calculate totals if not provided
      const calculatedTotal = total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const calculatedSubtotal = subtotal || calculatedTotal;
      
      const orderData = {
        userId,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        address,
        phone,
        total: calculatedTotal,
        subtotal: calculatedSubtotal,
        discounts: discounts || 0,
        gstAmount: gstAmount || 0,
        payment: {
          method: 'cash',
          success: false,
          transactionId: null,
          amount: calculatedTotal
        },
        status: 'pending',
        createdAt: new Date()
      };
      
      console.log('📝 Order data to save:', orderData);
      
      try {
        const order = new Order(orderData);
        await order.save();
        
        console.log('✅ Cash on delivery order created successfully:', {
          orderId: order._id,
          userId: order.userId,
          itemsCount: order.items.length,
          total: order.total
        });
        
        return res.status(200).json({ 
          success: true,
          message: 'Cash on delivery order created successfully!',
          order: order,
          orderId: order._id
        });
      } catch (saveError) {
        console.error('❌ Error saving cash order:', saveError);
        return res.status(500).json({ 
          error: 'Failed to save cash order to database.',
          details: saveError.message 
        });
      }
    }
    
    // For other payment methods, just validate and return order data
    const orderData = {
      userId,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      address,
      phone,
      total: total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      subtotal: subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      discounts: discounts || 0,
      gstAmount: gstAmount || 0
    };
    
    // Return order data for payment processing
    res.status(200).json({ 
      message: 'Order validated successfully!', 
      orderData 
    });
  } catch (err) {
    console.error('❌ Order creation/validation failed:', err);
    res.status(500).json({ 
      error: 'Failed to create/validate order.',
      details: err.message 
    });
  }
});

// Save feedback for an order
app.post('/feedback', authenticateJWT, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    
    if (!orderId || !rating) {
      return res.status(400).json({ error: 'Order ID and rating are required.' });
    }
    
    // Prevent duplicate feedback for the same order/user
    const existing = await Feedback.findOne({ orderId, userId });
    if (existing) {
      return res.status(400).json({ error: 'Feedback already submitted for this order.' });
    }
    
    const feedback = new Feedback({ orderId, userId, rating, comment });
    await feedback.save();

    // Find all products in this order and update their ratings
    try {
      const order = await Order.findById(orderId);
      if (order && order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.productId) {
            // Find all orders containing this product
            const ordersWithProduct = await Order.find({ 'items.productId': item.productId }).select('_id');
            const orderIds = ordersWithProduct.map(o => o._id);
            
            // Find all feedbacks for these orders
            const feedbacks = await Feedback.find({ 
              orderId: { $in: orderIds }, 
              rating: { $gte: 1 } 
            });
            
            // Get the current product to preserve existing fake data
            const currentProduct = await productModel.findById(item.productId);
            if (!currentProduct) continue;
            
            // Calculate new average by combining existing fake data with new feedback
            let totalRating = 0;
            let totalReviews = 0;
            
            // Add existing fake rating data (weighted by review count)
            if (currentProduct.averageRating && currentProduct.reviewCount) {
              totalRating += (currentProduct.averageRating * currentProduct.reviewCount);
              totalReviews += currentProduct.reviewCount;
            }
            
            // Add new feedback
            if (feedbacks.length > 0) {
              const feedbackSum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
              totalRating += feedbackSum;
              totalReviews += feedbacks.length;
            }
            
            // Calculate new average
            if (totalReviews > 0) {
              const newAverageRating = Math.round((totalRating / totalReviews) * 10) / 10;
              const newReviewCount = totalReviews;
              
              // Update product document
              await productModel.findByIdAndUpdate(item.productId, {
                averageRating: newAverageRating,
                reviewCount: newReviewCount
              });
            }
          }
        }
      }
    } catch (updateError) {
      console.error('Error updating product ratings:', updateError);
      // Don't fail the feedback submission if rating update fails
    }

    res.status(201).json({ message: 'Feedback submitted!', feedback });
  } catch (err) {
    console.error('Failed to submit feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// Save individual product review
app.post('/product-review', authenticateJWT, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.userId;
    
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ error: 'Product ID, Order ID, and rating are required.' });
    }
    
    // Check if user has already reviewed this product from this order
    const existing = await Feedback.findOne({ 
      orderId, 
      userId, 
      productId 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product from this order.' });
    }
    
    // Create new product review
    const productReview = new Feedback({ 
      orderId, 
      userId, 
      productId, 
      rating, 
      comment 
    });
    
    await productReview.save();

    // Update product's average rating and review count
    try {
      // Find all reviews for this product
      const productReviews = await Feedback.find({ 
        productId, 
        rating: { $gte: 1 } 
      });
      
      // Get the current product to preserve existing fake data
      const currentProduct = await productModel.findById(productId);
      if (!currentProduct) return;
      
      // Calculate new average by combining existing fake data with new reviews
      let totalRating = 0;
      let totalReviews = 0;
      
      // Add existing fake rating data (weighted by review count)
      if (currentProduct.averageRating && currentProduct.reviewCount) {
        totalRating += (currentProduct.averageRating * currentProduct.reviewCount);
        totalReviews += currentProduct.reviewCount;
      }
      
      // Add new real reviews
      if (productReviews.length > 0) {
        const newReviewsSum = productReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        totalRating += newReviewsSum;
        totalReviews += productReviews.length;
      }
      
      // Calculate new average
      if (totalReviews > 0) {
        const newAverageRating = Math.round((totalRating / totalReviews) * 10) / 10;
        const newReviewCount = totalReviews;
        
        // Update product document
        await productModel.findByIdAndUpdate(productId, {
          averageRating: newAverageRating,
          reviewCount: newReviewCount
        });
      }
    } catch (updateError) {
      console.error('Error updating product rating:', updateError);
      // Don't fail the review submission if rating update fails
    }

    res.status(201).json({ message: 'Product review submitted!', review: productReview });
  } catch (err) {
    console.error('Failed to submit product review:', err);
    res.status(500).json({ error: 'Failed to submit product review.' });
  }
});

// Get all orders for the authenticated user
app.get('/orders', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get a single order by ID for the authenticated user
app.get('/orders/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// Get user purchase recommendations based on order history
app.get('/user-recommendations', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's order history
    const userOrders = await Order.find({ 
      userId, 
      status: { $in: ['delivered', 'paid'] } 
    }).sort({ createdAt: -1 });
    
    // Extract all purchased products with quantities and last purchase dates
    const purchaseHistory = {};
    userOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId;
        if (!purchaseHistory[productId]) {
          purchaseHistory[productId] = {
            productId,
            name: item.name,
            price: item.price,
            image: item.image,
            totalQuantity: 0,
            orderCount: 0,
            lastOrdered: order.createdAt,
            firstOrdered: order.createdAt
          };
        }
        purchaseHistory[productId].totalQuantity += item.quantity;
        purchaseHistory[productId].orderCount += 1;
        if (order.createdAt > purchaseHistory[productId].lastOrdered) {
          purchaseHistory[productId].lastOrdered = order.createdAt;
        }
        if (order.createdAt < purchaseHistory[productId].firstOrdered) {
          purchaseHistory[productId].firstOrdered = order.createdAt;
        }
      });
    });
    
    // Convert to array and sort by frequency and recency
    const purchaseArray = Object.values(purchaseHistory);
    const buyAgainItems = purchaseArray
      .sort((a, b) => {
        // Sort by order count (frequency) first, then by last order date (recency)
        if (b.orderCount !== a.orderCount) {
          return b.orderCount - a.orderCount;
        }
        return new Date(b.lastOrdered) - new Date(a.lastOrdered);
      })
      .slice(0, 3); // Top 3 most frequently ordered items
    
    // For recommendations, get products user hasn't ordered recently
    const allProducts = await productModel.find({});
    const recommendedItems = allProducts
      .filter(product => !purchaseHistory[product._id])
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3); // Top 3 highest rated products not in purchase history
    
    // For wishlist, get products user has ordered but not recently
    const wishlistItems = purchaseArray
      .filter(item => {
        const daysSinceLastOrder = (Date.now() - new Date(item.lastOrdered)) / (1000 * 60 * 60 * 24);
        return daysSinceLastOrder > 7; // Items not ordered in last 7 days
      })
      .sort((a, b) => new Date(b.lastOrdered) - new Date(a.lastOrdered))
      .slice(0, 3);
    
    // Format dates for display
    const formatDate = (date) => {
      const now = new Date();
      const orderDate = new Date(date);
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    };
    
    // Add formatted dates and reasons
    const formattedBuyAgain = buyAgainItems.map(item => ({
      ...item,
      lastOrdered: formatDate(item.lastOrdered),
      reason: `Ordered ${item.orderCount} times`
    }));
    
    const formattedRecommended = recommendedItems.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reason: 'Based on high ratings and your preferences'
    }));
    
    const formattedWishlist = wishlistItems.map(item => ({
      ...item,
      lastOrdered: formatDate(item.lastOrdered),
      reason: 'You might like this again'
    }));
    
    res.status(200).json({
      buyAgain: formattedBuyAgain,
      recommended: formattedRecommended,
      wishlist: formattedWishlist
    });
    
  } catch (err) {
    console.error('Error fetching user recommendations:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations.' });
  }
});

// Get profile info for the authenticated user
app.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Customer.findById(userId).select('name email phone address city state pincode profileImage preferences');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// Update profile info for the authenticated user
app.put('/profile', authenticateJWT, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, city, state, pincode, preferences } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const update = { 
      name: name.trim(),
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    };

    // Handle preferences
    if (preferences) {
      try {
        let prefs = preferences;
        if (typeof preferences === 'string') {
          prefs = JSON.parse(preferences);
        }
        update.preferences = {
          emailNotifications: prefs.emailNotifications !== undefined ? prefs.emailNotifications : true,
          smsNotifications: prefs.smsNotifications !== undefined ? prefs.smsNotifications : false,
          newsletter: prefs.newsletter !== undefined ? prefs.newsletter : true,
          darkMode: prefs.darkMode !== undefined ? prefs.darkMode : false
        };
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }

    // Handle profile image upload
    if (req.file) {
      update.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await Customer.findByIdAndUpdate(userId, update, { 
      new: true, 
      select: 'name email phone address city state pincode profileImage preferences' 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change password route
app.put('/profile/password', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, newPassword } = req.body;
    
    if (!password || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at lest 6 characters.' });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Get user's reviews/feedback
app.get('/reviews', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviews = await Feedback.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Get product reviews
app.get('/product-reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get current product info
    const product = await productModel.findById(productId).select('averageRating reviewCount name');
    
    // Get reviews
    const reviews = await Feedback.find({ 
      productId, 
      rating: { $gte: 1 } 
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(10); // Limit to recent 10 reviews
    
    res.status(200).json({ 
      reviews,
      productInfo: {
        averageRating: product?.averageRating || 0,
        reviewCount: product?.reviewCount || 0,
        name: product?.name || 'Product'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product reviews.' });
  }
});

// Test email notification endpoint
app.post('/test-email', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Customer.findById(userId);
    
    if (!user?.email) {
      return res.status(400).json({ error: 'User email not found.' });
    }

    // Send test email
    await transporter.sendMail({
      from: 'bh.cafe712@gmail.com',
      to: user.email,
      subject: 'Brew Haven - Test Email Notification',
      html: `
        <h2>Test Email Notification</h2>
        <p>Hello ${user.name},</p>
        <p>This is a test email to confirm that your email notifications are working properly.</p>
        <p>If you received this email, your notification settings are configured correctly!</p>
        <p>Best regards,<br>Brew Haven Team ☕</p>
      `
    });

    res.status(200).json({ message: 'Test email sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send test email.' });
  }
});

// 💳 Demo Payment Integration
app.post('/create-payment-intent', authenticateJWT, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    // Simulate payment intent creation
    const paymentIntent = {
      id: 'pi_' + Math.random().toString(36).substr(2, 9),
      amount: amount,
      currency: currency,
      status: 'requires_payment_method',
      client_secret: 'pi_' + Math.random().toString(36).substr(2, 9) + '_secret_' + Math.random().toString(36).substr(2, 9),
      created: Math.floor(Date.now() / 1000)
    };

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntent: paymentIntent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});

// Process demo payment
app.post('/process-payment', authenticateJWT, async (req, res) => {
  try {
    const { paymentMethodId, amount, orderData, paymentDetails } = req.body;
    
    console.log('Received payment request:', { paymentMethodId, amount, orderData, paymentDetails });
    
    if (!paymentMethodId || !amount || !orderData) {
      console.log('Missing required fields:', { 
        hasPaymentMethodId: !!paymentMethodId, 
        hasAmount: !!amount, 
        hasOrderData: !!orderData 
      });
      return res.status(400).json({ error: 'Payment method, amount, and order data are required.' });
    }

    // Validate orderData structure
    if (!orderData.userId || !orderData.items || !orderData.total || !orderData.address || !orderData.phone) {
      console.log('Invalid orderData structure:', {
        hasUserId: !!orderData.userId,
        hasItems: !!orderData.items,
        hasTotal: !!orderData.total,
        hasAddress: !!orderData.address,
        hasPhone: !!orderData.phone
      });
      return res.status(400).json({ error: 'Invalid order data structure. Missing required fields.' });
    }

    // Validate payment details based on method
    if (paymentMethodId === 'pm_demo_upi' && (!paymentDetails?.upiId || !paymentDetails?.upiName)) {
      return res.status(400).json({ error: 'UPI ID and name are required for UPI payment.' });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      // Determine payment method for database
      let paymentMethod = 'card';
      if (paymentMethodId === 'pm_demo_upi') {
        paymentMethod = 'upi';
      } else if (paymentMethodId === 'pm_demo_cash') {
        paymentMethod = 'cash';
      }

      // Create order data with payment information
      const orderToSave = {
        ...orderData,
        payment: {
          method: paymentMethod,
          success: true,
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          amount: amount,
          details: paymentMethodId === 'pm_demo_upi' ? {
          upiId: paymentDetails.upiId,
          upiName: paymentDetails.upiName
        } : {}
        },
        status: paymentMethod === 'cash' ? 'pending' : 'paid',
        paidAt: paymentMethod === 'cash' ? null : new Date()
      };

      // Save order to database only after successful payment
      const order = new Order(orderToSave);
      await order.save();
      
      // Debug: log the whole order object
      console.log('Order object:', order);
      
      console.log('✅ Order saved to database after successful payment:', {
        orderId: order._id,
        userId: order.userId,
        itemsCount: order.items.length,
        paymentMethod: order.payment ? order.payment.method : null,
        status: order.status
      });

      res.status(200).json({ 
        success: true,
        message: 'Payment processed successfully!',
        transactionId: order.payment.transactionId,
        amount: amount,
        paymentMethod: paymentMethod,
        orderId: order._id
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'Payment failed. Please try again.',
        code: 'payment_declined'
      });
    }
  } catch (err) {
    console.error('❌ Payment processing failed:', err);
    res.status(500).json({ error: 'Payment processing failed.' });
  }
});

// Get payment methods (demo)
app.get('/payment-methods', authenticateJWT, async (req, res) => {
  try {
    // Demo payment methods
    const paymentMethods = [
      {
        id: 'pm_demo_visa',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        }
      },
      {
        id: 'pm_demo_mastercard',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5555',
          exp_month: 10,
          exp_year: 2026
        }
      }
    ];

    res.status(200).json({ paymentMethods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payment methods.' });
  }
});

// Test email endpoint (for debugging)
app.post('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email service...');
    
    if (!transporter) {
      console.error('❌ Email transporter not configured');
      return res.status(500).json({ error: 'Email service not configured.' });
    }
    
    const testResult = await transporter.sendMail({
      from: 'bh.cafe712@gmail.com',
      to: 'bh.cafe712@gmail.com', // Send to self for testing
      subject: '🧪 Brew Haven - Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0;">
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Server:</strong> ${req.headers.host || 'localhost'}</p>
          <p>If you receive this email, the email service is working! 🎉</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully:', testResult);
    res.status(200).json({ 
      message: 'Test email sent successfully!',
      emailId: testResult.messageId,
      sentTo: 'bh.cafe712@gmail.com'
    });
  } catch (err) {
    console.error('❌ Test email failed:', err);
    res.status(500).json({ 
      error: 'Test email failed',
      details: err.message,
      code: err.code
    });
  }
});

// Send order confirmation email
app.post('/send-order-email', authenticateJWT, async (req, res) => {
  try {
    console.log('📧 Starting email sending process...');
    
    const userId = req.user.userId;
    const { orderId, items, total, address, phone, payment } = req.body;
    
    console.log('📧 Email request data:', { userId, orderId, itemsCount: items?.length, total, address, phone, payment });
    
    // Validate required fields
    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Invalid email request data:', { orderId, items });
      return res.status(400).json({ error: 'Invalid order data for email.' });
    }
    
    const user = await Customer.findById(userId);
    if (!user?.email) {
      console.error('❌ User email not found for userId:', userId);
      return res.status(400).json({ error: 'User email not found.' });
    }
    
    console.log('📧 Sending email to:', user.email);

    // Create order items HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee;">
          ${item.name}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee; text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');

    // Payment method text
    let paymentMethod = 'Cash on Delivery';
    if (payment?.paymentMethodId === 'pm_demo_card' || payment?.method === 'card') {
      paymentMethod = 'Credit/Debit Card';
    } else if (payment?.paymentMethodId === 'pm_demo_upi' || payment?.method === 'upi') {
      paymentMethod = 'UPI Payment';
    }

    // Verify transporter is configured
    if (!transporter) {
      console.error('❌ Email transporter not configured');
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    console.log('📧 Sending email via transporter...');
    
    const emailResult = await transporter.sendMail({
      from: 'bh.cafe712@gmail.com',
      to: user.email,
      subject: `${process.env.APP_NAME || 'Brew Haven'} - Order Confirmation #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fafc; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(59,47,47,0.08);">
          <!-- Header -->
          <div style="background: #2d3748; padding: 32px 0 18px 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 2.1em; letter-spacing: 2px; font-weight: 700;">${process.env.APP_NAME || 'Brew Haven'}</h1>
            <p style="color: #c3dafe; margin: 0; font-size: 1.1em;">Order Confirmation</p>
          </div>

          <!-- Order Details Section -->
          <div style="padding: 28px 24px 18px 24px;">
            <h2 style="color: #2d3748; font-weight: 600; margin-bottom: 10px;">Thank you for your order, ${user.name}! 🎉</h2>
            <div style="color: #3182ce; font-size: 1.1em; margin-bottom: 8px;"><b>Order #${orderId.slice(-6).toUpperCase()}</b></div>
            <div style="color: #718096; font-size: 0.98em; margin-bottom: 18px;">Order Date: ${new Date().toLocaleDateString()} | Estimated Delivery: ${new Date(Date.now() + 40 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div style="background: #edf2f7; border-radius: 8px; padding: 16px 18px; margin-bottom: 18px;">
              <strong style="color: #2d3748;">Order Summary</strong>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #e3e8ee;">
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #3182ce;">Item</th>
                    <th style="padding: 8px; text-align: center; border-bottom: 2px solid #3182ce;">Qty</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 2px solid #3182ce;">Price</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 2px solid #3182ce;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="text-align: right; margin-top: 12px; padding-top: 10px; border-top: 2px solid #3182ce; font-size: 1.1em; color: #3182ce; font-weight: 700;">
                Total: ₹${total}
              </div>
            </div>

            <!-- Delivery Info -->
            <div style="background: #edf2f7; border-radius: 8px; padding: 16px 18px; margin-bottom: 18px;">
              <strong style="color: #2d3748;">Delivery Information</strong>
              <p style="margin: 8px 0 0 0; color: #2d3748;"><b>Address:</b> ${address}</p>
              <p style="margin: 4px 0 0 0; color: #2d3748;"><b>Phone:</b> ${phone}</p>
              <p style="margin: 4px 0 0 0; color: #2d3748;"><b>Payment Method:</b> ${paymentMethod}</p>
              ${payment?.transactionId ? `<p style="margin: 4px 0 0 0; color: #2d3748;"><b>Transaction ID:</b> ${payment.transactionId}</p>` : ''}
              ${payment?.paymentMethod === 'upi' ? `<p style="margin: 4px 0 0 0; color: #2d3748;"><b>UPI ID:</b> ${req.body.paymentDetails?.upiId || 'N/A'}</p>` : ''}
            </div>

            <!-- Payment Status Block -->
            <div style="background: ${payment && (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') ? '#bee3f8' : '#c6f6d5'}; padding: 15px; border-radius: 6px; border-left: 4px solid ${payment && (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') ? '#63b3ed' : '#38a169'}; margin-bottom: 20px;">
              <strong style="color: ${payment && (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash') ? '#2b6cb0' : '#276749'};">
                ${payment && (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash')
                  ? '⏳ Payment Status: Pending (Cash on Delivery)'
                  : '✅ Payment Status: Paid'}
              </strong><br>
              <small style="color: #4a5568;">
                ${payment && (payment.method === 'cash' || payment.paymentMethodId === 'pm_demo_cash')
                  ? 'Please pay with cash when your order is delivered.'
                  : 'Your payment has been processed successfully.'}
              </small>
            </div>

            <div style="text-align: center; color: #4a5568; font-size: 14px; margin-top: 32px;">
              <p>If you have any questions, please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@brewhaven.com'}" style="color: #3182ce; text-decoration: underline;">${process.env.SUPPORT_EMAIL || 'support@brewhaven.com'}</a></p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #2d3748; color: #fff; text-align: center; padding: 18px 0 10px 0; border-radius: 0 0 16px 16px;">
            <div style="font-size: 1.1em; font-weight: 600; letter-spacing: 1px;">${process.env.APP_NAME || 'Brew Haven'}</div>
            <div style="margin-top: 8px;">
              <a href="https://instagram.com/" style="display: inline-block; margin: 0 8px; color: #fff; text-decoration: none;">
                Instagram
              </a>
              <a href="https://facebook.com/" style="display: inline-block; margin: 0 8px; color: #fff; text-decoration: none;">
                Facebook
              </a>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: #c3dafe;">&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Brew Haven'}. All rights reserved.</div>
          </div>
        </div>
      `
    });

    console.log('✅ Email sent successfully to:', user.email);
    console.log('📧 Email result:', emailResult);

    res.status(200).json({ 
      message: 'Order confirmation email sent successfully!',
      emailId: emailResult.messageId,
      sentTo: user.email
    });
  } catch (err) {
    console.error('❌ Email sending failed:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send order confirmation email.';
    if (err.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check email credentials.';
    } else if (err.code === 'ECONNECTION') {
      errorMessage = 'Email service connection failed. Please try again later.';
    } else if (err.code === 'ETIMEDOUT') {
      errorMessage = 'Email service timeout. Please try again later.';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 🔐 Admin Routes
// Admin Login
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use environment variables for admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cafeteria.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign(
        { userId: 'admin', email: adminEmail },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        admin: {
          name: 'Admin User',
          email: adminEmail,
          role: 'administrator'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Dashboard Statistics
app.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await productModel.countDocuments();
    const totalUsers = await Customer.countDocuments();
    
    // Calculate total revenue from paid orders (more comprehensive than just 'delivered')
    const paidOrders = await Order.find({ 
      $or: [
        { status: 'delivered' },
        { status: 'paid' },
        { status: 'preparing' },
        { status: 'out_for_delivery' },
        { 'payment.success': true }
      ]
    });
    const totalRevenue = paidOrders.reduce((sum, order) => {
      // Try multiple sources for order amount
      const amount = order.payment?.amount || 
                    order.total || 
                    order.subtotal || 
                    order.items?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 
                    0;
      return sum + amount;
    }, 0);
    
    // Get order status breakdown
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$payment.amount', '$total', '$subtotal', 0] } }
        }
      }
    ]);
    
    const orderStatusCounts = {};
    orderStatuses.forEach(status => {
      orderStatusCounts[status._id] = {
        count: status.count,
        totalAmount: status.totalAmount
      };
    });
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.price', '$items.quantity'] 
            } 
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);
    
    // Get monthly revenue trend (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { 
            $sum: { $ifNull: ['$payment.amount', '$total', '$subtotal', 0] } 
          },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      orderStatusCounts,
      topProducts,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Admin Recent Orders
app.get('/admin/recent-orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email phone');
    
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      customerName: order.userId?.name || 'N/A',
      customerEmail: order.userId?.email || 'N/A',
      customerPhone: order.phone || 'N/A',
      items: order.items,
      totalAmount: order.payment?.amount || 0,
      status: order.status,
      createdAt: order.createdAt
    }));
    
    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin Products Management
app.get('/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    const newProduct = await productModel.create({
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      available: available !== false
    });
    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, available } = req.body;
    
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        available: available !== false
      },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Admin Users Management
app.get('/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await Customer.find()
      .sort({ createdAt: -1 })
      .select('name email phone createdAt');
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin Orders Management
app.get('/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      customerName: order.userId?.name || 'N/A',
      customerEmail: order.userId?.email || 'N/A',
      customerPhone: order.phone || 'N/A',
      items: order.items,
      totalAmount: order.payment?.amount || 0,
      status: order.status,
      createdAt: order.createdAt
    }));
    
    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 🛒 Cart Endpoints
// Get user's cart
app.get('/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await cartModel.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      // Create empty cart if none exists
      cart = await cartModel.create({ userId, items: [] });
    }
    
    res.json({ items: cart.items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    let cart = await cartModel.findOne({ userId });
    
    if (!cart) {
      // Create new cart if none exists
      cart = new cartModel({ userId, items: [] });
    }
    
    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    
    if (existingItem) {
      // Update quantity if product already exists
      existingItem.quantity += quantity;
    } else {
      // Add new product to cart
      cart.items.push({ productId, quantity });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    // Populate product details for response
    await cart.populate('items.productId');
    
    res.json({ 
      message: 'Item added to cart successfully',
      cart: cart.items 
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
app.put('/cart/:productId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    const cart = await cartModel.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item.productId.toString() === productId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();
    
    await cart.populate('items.productId');
    
    res.json({ 
      message: 'Cart updated successfully',
      cart: cart.items 
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
app.delete('/cart/:productId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    
    const cart = await cartModel.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();
    
    await cart.populate('items.productId');
    
    res.json({ 
      message: 'Item removed from cart successfully',
      cart: cart.items 
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
app.delete('/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const cart = await cartModel.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    
    res.json({ 
      message: 'Cart cleared successfully',
      cart: { items: [] }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

app.put('/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 🚨 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });


// ✅ Start Server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Server started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});