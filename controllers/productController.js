const service = require('../services/productService');

// Forward async errors to the error middleware.
const handler = (fn) => (req, res, next) => {
  Promise.resolve()
    .then(() => fn(req, res))
    .catch(next);
};

exports.getProducts = handler(async (req, res) => {
  const products = await service.getProducts();

  res.json(products);
});

exports.getProduct = handler(async (req, res) => {
  const product = await service.getProduct(req.params.id);

  res.json(product);
});

exports.createProduct = handler(async (req, res) => {
  const product = await service.createProduct(req.body);

  res.status(201).json(product);
});

exports.replaceProduct = handler(async (req, res) => {
  const product = await service.changeProduct(
    req.params.id,
    req.body,
    false
  );

  res.json(product);
});

exports.updateProduct = handler(async (req, res) => {
  const product = await service.changeProduct(
    req.params.id,
    req.body,
    true
  );

  res.json(product);
});

exports.deleteProduct = handler(async (req, res) => {
  const product = await service.deleteProduct(req.params.id);

  res.json({
    message: 'Product deleted',
    product,
  });
});