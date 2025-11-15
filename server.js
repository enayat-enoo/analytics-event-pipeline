const express = require('express');
const app = express();
const router = require('./routes/routes');
const connectToMongoDB = require('./config/mongoDb');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/analytics-events';

// Connect to MongoDB
connectToMongoDB(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err)); 

app.use(express.json());    
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});