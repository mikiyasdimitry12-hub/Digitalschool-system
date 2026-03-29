const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ Routes (keep your existing ones)
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teachers'));
app.use('/api/student', require('./routes/student'));
app.use('/api/auth', require('./routes/auth'));

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Default route (IMPORTANT)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// ✅ PORT FIX (VERY IMPORTANT)
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ✅ SOCKET FIX
const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    socket.on('join-school', (schoolCode) => {
        socket.join(schoolCode);
    });

    socket.on('send-message', (data) => {
        io.to(data.schoolCode).emit('new-message', data);
    });
});