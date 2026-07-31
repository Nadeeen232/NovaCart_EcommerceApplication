import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

const getPopulatedCart = (userId) =>
  Cart.findOne({ user: userId }).populate('items.product');

router.get('/', async (req, res) => {
  const cart = await getPopulatedCart(req.user._id);
  return res.json(cart ?? { items: [] });
});

router.post('/items', async (req, res) => {
  const quantity = Math.max(1, Number(req.body.quantity) || 1);
  const product = await Product.findById(req.body.productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.stock < 1) {
    return res.status(409).json({ message: 'Product is out of stock' });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === req.body.productId
  );

  if (item) {
    item.quantity = Math.min(item.quantity + quantity, product.stock);
  } else {
    cart.items.push({
      product: product._id,
      quantity: Math.min(quantity, product.stock),
    });
  }

  await cart.save();
  return res.status(201).json(await getPopulatedCart(req.user._id));
});

router.patch('/items/:productId', async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.find(
    (cartItem) => cartItem.product.toString() === req.params.productId
  );

  if (!item) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  item.quantity = Math.min(
    Math.max(1, Number(req.body.quantity) || 1),
    product.stock
  );

  await cart.save();
  return res.json(await getPopulatedCart(req.user._id));
});

router.delete('/items/:productId', async (req, res) => {
  await Cart.updateOne(
    { user: req.user._id },
    { $pull: { items: { product: req.params.productId } } }
  );

  const cart = await getPopulatedCart(req.user._id);
  return res.json(cart ?? { items: [] });
});

export default router;
