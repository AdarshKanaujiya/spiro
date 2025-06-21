import express from 'express';
import { addToHistory, getHistory, clearHistory } from '../controller/historyController.js';
import authUser from '../middleware/auth.js';

const historyRouter = express.Router();

// Protected routes - require authentication
historyRouter.post('/add', authUser, addToHistory);
historyRouter.get('/', authUser, getHistory);
historyRouter.delete('/', authUser, clearHistory);

export default historyRouter;