import express from "express";
import {clearCache} from "../controllers/config.controller";

const configRouter = express.Router();

// @ts-ignore
configRouter.get("/clear-cache", clearCache);

export default configRouter;