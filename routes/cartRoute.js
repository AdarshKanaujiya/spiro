import express from 'express';
import { getUserCart, addToCart, removeFromCart, clearCart } from '../controller/cartController.js';

const cartRouter = express.Router();

cartRouter.post('/get', getUserCart);
cartRouter.post('/add', addToCart);
cartRouter.post('/remove', removeFromCart); // <-- fixed here
cartRouter.post("/clear", clearCart);


export default cartRouter;
