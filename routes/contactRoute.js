import express from "express";
import { sendcontact } from "../controller/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/", sendcontact);

export default contactRouter;
