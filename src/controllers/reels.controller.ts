import { Request, Response } from "express";
import { sql } from "../database/neon.database";

export const getAllReels = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const result = await sql`
            SELECT * FROM reels
            ORDER BY id ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const totalCountResult = await sql`SELECT COUNT(*) AS total FROM reels`;
        let totalCount = parseInt(totalCountResult[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        if (result.length === 0) {
            return res.status(404).json({ message: "No reels found." });
        }

        return res.status(200).json({
            data: result,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                nextPage: page === totalPages ? 1 : page + 1,
            },
        });
    } catch (error: any) {
        console.error("Error fetching reels:", error);

        return res.status(500).json({
            message: "There was an error fetching the reels. Please try again later.",
            error: error.message,
        });
    }
};

export const getReelById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await sql`
            SELECT * FROM reels
            WHERE id = ${id}
            LIMIT 1
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "No reel found." });
        }

        return res.status(200).json(
            result[0]
        );
    } catch (error: any) {
        console.error("Error fetching reel:", error);

        return res.status(500).json({
            message: "There was an error fetching the reel. Please try again later.",
            error: error.message,
        });
    }
};

export const getCarouselReels = async (req: Request, res: Response) => {
    try {
        // await clearQueryCache();

        const result = await sql`SELECT * FROM reels ORDER BY RANDOM() LIMIT 9;`;

        if (result.length === 0) {
            return res.status(404).json({ message: "No carousel reels found." });
        }

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Error fetching carousel reels:", error);

        return res.status(500).json({
            message: "There was an error fetching the carousel reels. Please try again later.",
            error: error.message,
        });
    }
};

export const updateLikes = async (req: Request, res: Response) => {
    const { id } = req.params;
    const increment = parseInt(req.query.increment as string) || 1;
    let action = '';

    try {
        const result = await sql`
            SELECT * FROM reels WHERE id = ${id}
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Reel not found." });
        }

        if(increment > 0) {
            const updatedResult = await sql`
            UPDATE reels
            SET likes = likes + 1  
            WHERE id = ${id}
                RETURNING *;
        `;
            action = 'incremented';

            return res.status(200).json({...updatedResult[0], action});
        } else {
            const updatedResult = await sql`
            UPDATE reels
            SET likes = likes - 1  
            WHERE id = ${id}
                RETURNING *;
        `;
            action = 'decremented';

            return res.status(200).json({...updatedResult[0], action});
        }
    } catch (error: any) {
        console.error("Error updating likes:", error);

        return res.status(500).json({
            message: "There was an error updating the likes. Please try again later.",
            error: error.message,
        });
    }
};

export const getDiscoverReels = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const result = await sql`
            SELECT * FROM reels
            ORDER BY likes DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const totalCountResult = await sql`SELECT COUNT(*) AS total FROM reels`;
        let totalCount = parseInt(totalCountResult[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        if (result.length === 0) {
            return res.status(404).json({ message: "No reels found." });
        }

        return res.status(200).json({
            data: result,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                nextPage: page === totalPages ? 1 : page + 1,
            },
        });
    } catch (error: any) {
        console.error("Error fetching reels:", error);

        return res.status(500).json({
            message: "There was an error fetching the reels. Please try again later.",
            error: error.message,
        });
    }
};

export const incrementViews = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await sql`
            SELECT * FROM reels WHERE id = ${id}
        `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Reel not found." });
        }

        const updatedResult = await sql`
            UPDATE reels
            SET views = views + 1
            WHERE id = ${id}
                RETURNING *;
        `;

        return res.status(200).json(updatedResult[0]);
    } catch (error: any) {
        console.error("Error incrementing views:", error);

        return res.status(500).json({
            message: "There was an error incrementing the views. Please try again later.",
            error: error.message,
        });
    }
};

