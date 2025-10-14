// import express from 'express';
// import multer from 'multer';
// import Transaction from '../models/Transaction.js';
// import auth from '../Middleware/auth.js';

// const router = express.Router();

// // Configure multer for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/pdf',
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX, XLSX files are allowed.'));
//     }
//   }
// });

// // Get all transactions with filters
// router.get('/', auth, async (req, res) => {
//   try {
//     const { type, category, search, page = 1, limit = 10 } = req.query;
    
//     const filter = { createdBy: req.user.id };
    
//     if (type) filter.type = type;
//     if (category) filter.category = category;
    
//     if (search) {
//       filter.$or = [
//         { description: { $regex: search, $options: 'i' } },
//         { remarks: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const transactions = await Transaction.find(filter)
//       .sort({ date: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Transaction.countDocuments(filter);

//     // Calculate totals
//     const incomeTotal = await Transaction.aggregate([
//       { $match: { ...filter, type: 'Income' } },
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     const expenseTotal = await Transaction.aggregate([
//       { $match: { ...filter, type: 'Expense' } },
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     res.json({
//       transactions,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       totals: {
//         income: incomeTotal[0]?.total || 0,
//         expenses: expenseTotal[0]?.total || 0,
//         net: (incomeTotal[0]?.total || 0) - (expenseTotal[0]?.total || 0)
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get single transaction
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const transaction = await Transaction.findOne({
//       _id: req.params.id,
//       createdBy: req.user.id
//     });

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     res.json(transaction);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Create new transaction
// router.post('/', auth, async (req, res) => {
//   try {
//     const { description, amount, type, category, remarks, attachment } = req.body;

//     const transaction = new Transaction({
//       description,
//       amount: parseFloat(amount),
//       type,
//       category,
//       remarks: remarks || '',
//       attachment,
//       createdBy: req.user.id
//     });

//     await transaction.save();

//     res.status(201).json({
//       message: 'Transaction added successfully',
//       transaction
//     });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         message: 'Validation error', 
//         errors: Object.values(error.errors).map(e => e.message) 
//       });
//     }
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update transaction
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const transaction = await Transaction.findOneAndUpdate(
//       { _id: req.params.id, createdBy: req.user.id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     res.json({ message: 'Transaction updated successfully', transaction });
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         message: 'Validation error', 
//         errors: Object.values(error.errors).map(e => e.message) 
//       });
//     }
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Delete transaction
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const transaction = await Transaction.findOneAndDelete({
//       _id: req.params.id,
//       createdBy: req.user.id
//     });

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     res.json({ message: 'Transaction deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get transaction statistics
// router.get('/stats/summary', auth, async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const filter = { createdBy: req.user.id };

//     if (startDate && endDate) {
//       filter.date = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const stats = await Transaction.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: '$type',
//           total: { $sum: '$amount' },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const income = stats.find(s => s._id === 'Income')?.total || 0;
//     const expenses = stats.find(s => s._id === 'Expense')?.total || 0;

//     res.json({
//       totalIncome: income,
//       totalExpenses: expenses,
//       netIncome: income - expenses,
//       transactionCount: stats.reduce((acc, curr) => acc + curr.count, 0)
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// export default router; // Make sure this line is at the end

import express from 'express';
import multer from 'multer';
import Transaction from '../models/Transaction.js';
import auth from '../Middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX, XLSX files are allowed.'));
    }
  }
});

// Get all transactions with filters
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, search, page = 1, limit = 10 } = req.query;
    
    const filter = { createdBy: req.user.id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    // Calculate totals
    const incomeTotal = await Transaction.aggregate([
      { $match: { ...filter, type: 'Income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenseTotal = await Transaction.aggregate([
      { $match: { ...filter, type: 'Expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totals: {
        income: incomeTotal[0]?.total || 0,
        expenses: expenseTotal[0]?.total || 0,
        net: (incomeTotal[0]?.total || 0) - (expenseTotal[0]?.total || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new transaction with file upload
router.post('/', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { description, amount, type, category, remarks } = req.body;

    let attachment = null;
    if (req.file) {
      attachment = {
        filename: req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        data: req.file.buffer // Store file data in buffer
      };
    }

    const transaction = new Transaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      remarks: remarks || '',
      attachment,
      createdBy: req.user.id
    });

    await transaction.save();

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download attachment
router.get('/:id/attachment', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!transaction || !transaction.attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', transaction.attachment.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${transaction.attachment.originalName}"`);
    
    // Send the file buffer
    res.send(transaction.attachment.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { createdBy: req.user.id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const income = stats.find(s => s._id === 'Income')?.total || 0;
    const expenses = stats.find(s => s._id === 'Expense')?.total || 0;

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      transactionCount: stats.reduce((acc, curr) => acc + curr.count, 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;