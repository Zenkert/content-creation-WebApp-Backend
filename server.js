const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('./src/startUps/logging')(app);
const dotenv = require('dotenv');
dotenv.config();

const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://root:root1234@3.71.216.21:27017', {
// mongoose.connect('mongodb://localhost:27017/test', {
// mongoose.connect(process.env.MONGODB_URL ||
//     'mongodb+srv://naila12345:naila12345@cluster0.vw63h.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));

require('./src/startUps/cors-policy')(app);
require('./src/startUps/routes')(app);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));



// Deployment use for angular on Heroku
// app.use(express.static(__dirname + 'dist'));
// app.all('*', (req, res) => {
//     res.status(200).sendFile(__dirname, 'dist/index.html')
// })

