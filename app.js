'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const models = require('./models').sequelize;

//Instantiate an instance of the Sequelize class and 
//configure the instance to use the fsjstd-restapi.db SQLite database that you generated when setting up the project.

const db = new Sequelize({
  dialect: "sqlite",
  storage: "./fsjstd-restapi.db"
})

db.authenticate()
.then(() => {
  console.log('Connected to database.');
})
.catch(err => console.error('The connection failed.'));

const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api', require('./routes/index'));
app.use('/api/users', require('./routes/user'));
app.use('/api/courses', require('./routes/course'));


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

app.set('port', process.env.PORT || 5001);

// start listening on port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
