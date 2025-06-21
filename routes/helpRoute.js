import express from "express";
import { sendhelp } from "../controller/helpController.js";

const helpRouter = express.Router();

helpRouter.post("/", sendhelp);

export default helpRouter;
