import express from 'express';
import { createOrder, paymentSuccess } from '../controller/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', createOrder);
paymentRouter.post('/payment-success', paymentSuccess);

export default paymentRouter;
