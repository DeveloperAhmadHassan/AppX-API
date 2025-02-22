import express from "express";
import {
    getAllReels,
    getCarouselReels,
    getDiscoverReels,
    getReelById,
    incrementViews,
    updateLikes
} from "../controllers/reels.controller";

const reelRouter = express.Router();

// @ts-ignore
reelRouter.get("/", getAllReels);
// @ts-ignore
reelRouter.get("/carousel/", getCarouselReels);
// @ts-ignore
reelRouter.get("/discover/", getDiscoverReels);
// @ts-ignore
reelRouter.get("/:id", getReelById);
// @ts-ignore
reelRouter.put("/likes/:id", updateLikes);
// @ts-ignore
reelRouter.put("/views/:id", incrementViews);

export default reelRouter;