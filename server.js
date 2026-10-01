const express = require('express');
const app = express();
const fs = require('fs/promises');
const path = require('path');
const port = 3000;
let filePath = path.join(__dirname, 'db.json');

let cache = {};

async function readFile() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}

async function writeFile(data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

async function delayReadData() {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 1500);
    });
    return await readFile();
}

app.get('/products', async (req, res) => {
    let key = req.url;
    let value = cache[key];
    if (value) {
        console.log('Serving from cache');
        return res.json(cache[key]);
    }
    let products = await delayReadData();
    cache[key] = products;
    res.json(products);

});

app.get('/products/:id', async (req, res) => {
    let key = req.url;
    let value = cache[key];
    const productId = parseInt(req.params.id);
    if (value) {
        console.log('Serving from cache');
        return res.json(cache[key].find(p => p.id === productId));
    }
    let products = await delayReadData();
    cache[key] = products;
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
});

app.post('/products', express.json(), async (req, res) => {
    const newProduct = req.body;
    let products = await readFile();
    products.push(newProduct);
    await writeFile(products);
    cache = {}; // Clear cache after adding a new product
    res.status(201).json(newProduct);
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});