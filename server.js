const express = require('express');

const productRoutes = require('./routes/productRoutes');

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());

// All routes in productRoutes start with /products.
app.use('/products', productRoutes);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Handle errors from controllers, services and database.
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.status || 500).json({
    message: err.status
      ? err.message
      : 'Internal server error',
  });
});

// Start the server when running node server.js.
if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server: http://localhost:3000');
  });
}

module.exports = app;