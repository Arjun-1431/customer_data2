const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const submitRoute = require('./api/submit');
const dataRoute = require('./api/data');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = 'mongodb+srv://erarjunsingh32085:123@cluster0.zvimsjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/submit', submitRoute);
app.use('/api/data', dataRoute);

app.listen(3000, () => console.log('🚀 Server running on port 3000'));
