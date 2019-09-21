const dotenv = require('dotenv');
dotenv.config();
const mongodb = require('mongodb');

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(error, Client){
  module.exports = Client.db();
  const app = require('./app');
  app.listen(process.env.PORT);
});