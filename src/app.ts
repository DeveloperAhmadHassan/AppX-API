import express from 'express';
import cors from 'cors';
import reelRouter from "../src/routes/reels.route";
import configRouter from "./routes/config.route";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
    });
});

app.use("/api/reels/", reelRouter);
app.use("/api/db/config", configRouter);

app.listen(3000, () => console.log("Server is Running"));

export default app;
