import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DUMMY_PRODUCTS, CATEGORIES } from './data.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// In-memory carts and orders
const carts = {};
const orders = {};

const ORDERS_FILE = path.join(__dirname, 'orders.xlsx');

// Initialize Excel file if not exists
const initExcel = async () => {
  if (!fs.existsSync(ORDERS_FILE)) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');
    sheet.columns = [
      { header: 'Order ID', key: 'id', width: 20 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Customer Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];
    await workbook.xlsx.writeFile(ORDERS_FILE);
    console.log('Created orders.xlsx');
  }
};
initExcel();

// --- Orders ---
app.get('/api/orders/:id', (req, res) => {
  const order = orders[req.params.id];
  if (order) res.json(order);
  else res.status(404).json({ message: 'Order not found' });
});

// --- Products ---
app.get('/api/products', (req, res) => {
  let { category, search, min_price, max_price, featured } = req.query;
  let products = [...DUMMY_PRODUCTS];

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  if (search) {
    products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (min_price) products = products.filter(p => p.price >= Number(min_price));
  if (max_price) products = products.filter(p => p.price <= Number(max_price));
  if (featured === 'true') products = products.filter(p => p.featured);

  res.json(products);
});

app.get('/api/products/featured', (req, res) => {
    res.json(DUMMY_PRODUCTS.filter(p => p.featured).slice(0, 6));
});

app.get('/api/products/:id', (req, res) => {
  const product = DUMMY_PRODUCTS.find(p => p.id === req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ message: 'Product not found' });
});

app.get('/api/categories', (req, res) => {
  res.json(CATEGORIES);
});

// --- Cart ---
app.post('/api/cart/create', (req, res) => {
  const id = uuidv4();
  carts[id] = { id, items: [], total: 0 };
  res.json(carts[id]);
});

app.get('/api/cart/:id', (req, res) => {
  const cart = carts[req.params.id];
  if (cart) res.json(cart);
  else res.status(404).json({ message: 'Cart not found' });
});

app.post('/api/cart/:id/add', (req, res) => {
  const { id } = req.params;
  const { product_id, quantity } = req.body;
  
  if (!carts[id]) carts[id] = { id, items: [], total: 0 }; // Auto-create if missing
  const cart = carts[id];

  const product = DUMMY_PRODUCTS.find(p => p.id === product_id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const existing = cart.items.find(i => i.product_id === product_id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product_id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }
  
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json(cart);
});

app.post('/api/cart/:id/remove', (req, res) => {
  const { id } = req.params;
  const { product_id } = req.query;
  const cart = carts[id];
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(i => i.product_id !== product_id);
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json(cart);
});

app.post('/api/cart/:id/update', (req, res) => {
  const { id } = req.params;
  const { product_id, quantity } = req.body;
  const cart = carts[id];
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(i => i.product_id === product_id);
  if (item) {
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product_id !== product_id);
    } else {
      item.quantity = quantity;
    }
  }
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json(cart);
});

// --- Checkout & Excel ---
app.post('/api/orders', async (req, res) => {
  const { cart_id, customer } = req.body;
  const cart = carts[cart_id];
  
  // Try to find cart, or just accept if data is passed directly (fallback)
  // But for now assume cart_id is valid or we use data passed
  if (!cart) {
      // In a real app we might reject, but for demo let's assume we proceed or error
      return res.status(404).json({ message: 'Cart not found' });
  }

  const orderId = uuidv4();
  const order = {
    id: orderId,
    date: new Date().toISOString(),
    customer,
    items: cart.items,
    total: cart.total,
    status: 'Placed',
    payment_status: 'Paid' // Simulated
  };

  // Save to memory
  orders[orderId] = order;

  // Add to Excel
  try {
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(ORDERS_FILE)) {
      await workbook.xlsx.readFile(ORDERS_FILE);
    } else {
      const sheet = workbook.addWorksheet('Orders');
       sheet.columns = [
        { header: 'Order ID', key: 'id', width: 20 },
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Customer Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];
    }
    const sheet = workbook.getWorksheet('Orders');
    sheet.addRow({
      id: order.id,
      date: order.date,
      name: customer.full_name,
      email: customer.email,
      total: order.total,
      status: 'Placed'
    });
    
    // Also add a detail sheet or row? For now simplest is one row per order.
    // If user wants details, we could add a format string to a column.
    
    await workbook.xlsx.writeFile(ORDERS_FILE);
    console.log(`Order ${orderId} saved to Excel.`);
  } catch (err) {
    console.error('Error saving to Excel:', err);
    // Don't fail the request just because excel failed?
    // User requested specifically to save to excel, so maybe we should log it but return success for the order.
  }

  // Clear cart
  carts[cart_id] = { id: cart_id, items: [], total: 0 };

  res.json(order);
});


app.listen(PORT, () => {
  console.log(`Node server running on http://localhost:${PORT}`);
});
