const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, 'db.json');

let writeQueue = Promise.resolve();

// Read the stored products.
async function readFile() {
  const text = await fs.readFile(filePath, 'utf8');
  const products = JSON.parse(text);

  if (!Array.isArray(products)) {
    throw new Error('db.json must contain an array');
  }

  return products;
}

// Write the updated products.
async function writeFile(products) {
  const temporaryPath = `${filePath}.tmp`;

  await fs.writeFile(
    temporaryPath,
    JSON.stringify(products, null, 2)
  );

  await fs.rename(temporaryPath, filePath);
}

// Simulate a slow database read.
async function delayReadData() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return readFile();
}

// Run updates one at a time to avoid losing simultaneous changes.
function modifyProducts(modify) {
  const operation = writeQueue.then(async () => {
    const products = await readFile();

    const result = modify(products);

    await writeFile(products);

    return result;
  });

  // A failed operation should not block later operations.
  writeQueue = operation.catch(() => {});

  return operation;
}

module.exports = {
  delayReadData,
  modifyProducts,
};