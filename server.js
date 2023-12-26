const express = require('express');
var bodyParser = require('body-parser');
const dbConnect = require('./database/index');
const {PORT} = require('./config/index')
const router = require('./routes/index') 
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const corsOptions ={
    credentials: true,
    origin: ['http://localhost:3000']
}

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

app.use(cors(corsOptions));
app.use(router);

dbConnect();

// app.get('/', (req, res) => res.json({ msg: "Hello World!"}));
app.use('/storage', express.static('storage'));
app.use(errorHandler); // all middleware run sequentilally thats why we use it at end.
app.listen(PORT, console.log('Backend is running on Port:', PORT));