const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
// Retry logic for MongoDB connection (useful in Docker/K8s startup)
const connectWithRetry = () => {
    console.log('Attempting MongoDB connection...');
    mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/expense_tracker')
        .then(() => console.log('MongoDB Connected'))
        .catch(err => {
            console.error('MongoDB connection unsuccessful, retry after 5 seconds.', err);
            setTimeout(connectWithRetry, 5000);
        });
};
connectWithRetry();

// Schema
const TransactionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    amount: {
        type: Number,
        required: [true, 'Please add a positive or negative number']
    },
    category: {
        type: String,
        enum: ['salary', 'food', 'rent', 'travel', 'others'],
        default: 'others'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// Routes
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            res.status(400).json({ success: false, error: messages });
        } else {
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }
        await transaction.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

app.delete('/api/transactions', async (req, res) => {
    // Hidden endpoint to clear db for easier testing
    try {
        await Transaction.deleteMany({});
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
