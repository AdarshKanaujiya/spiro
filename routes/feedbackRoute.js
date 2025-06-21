import express from "express";
import { sendFeedback } from "../controller/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", sendFeedback);

export default feedbackRouter;
