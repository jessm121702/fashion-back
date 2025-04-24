const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
dotenv.config();a
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRoutes);
app.get('/test', (req, res) => {
    res.json({ message: 'Backend is running' });
});
console.log("🔥 Render-assigned PORT:", process.env.PORT);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
