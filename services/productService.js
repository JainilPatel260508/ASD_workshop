const database = require('../database/productDatabase');

// Create an error with an HTTP status.
function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

// Convert and validate a product ID.
function parseId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    fail(400, 'ID must be a positive integer');
  }

  return id;
}

// Request bodies must be JSON objects.
function validateBody(body) {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    fail(400, 'Send a JSON object');
  }
}

// Find a product or throw a 404 error.
function findIndex(products, id) {
  const index = products.findIndex(
    (product) => product.id === id
  );

  if (index === -1) {
    fail(404, 'Product not found');
  }

  return index;
}

// GET /products
exports.getProducts = () => {
  return database.delayReadData();
};

// GET /products/:id
exports.getProduct = async (value) => {
  const id = parseId(value);
  const products = await database.delayReadData();

  return products[findIndex(products, id)];
};

// POST /products
exports.createProduct = async (body) => {
  validateBody(body);

  return database.modifyProducts((products) => {
    // Generate an ID when the request does not supply one.
    const id = body.id === undefined
      ? parseId(
          Math.max(
            0,
            ...products.map((product) => product.id)
          ) + 1
        )
      : parseId(body.id);

    if (products.some((product) => product.id === id)) {
      fail(409, 'ID already exists');
    }

    const product = { ...body, id };

    products.push(product);

    return product;
  });
};

// PUT replaces fields; PATCH merges fields.
exports.changeProduct = async (value, body, partial) => {
  const id = parseId(value);

  validateBody(body);

  if (
    body.id !== undefined &&
    parseId(body.id) !== id
  ) {
    fail(400, 'Product ID cannot be changed');
  }

  return database.modifyProducts((products) => {
    const index = findIndex(products, id);

    products[index] = partial
      ? { ...products[index], ...body, id }
      : { ...body, id };

    return products[index];
  });
};

// DELETE /products/:id
exports.deleteProduct = async (value) => {
  const id = parseId(value);

  return database.modifyProducts((products) => {
    const index = findIndex(products, id);

    return products.splice(index, 1)[0];
  });
};