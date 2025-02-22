import { Request, Response } from "express";
import { sql } from "../database/neon.database";


const clearQueryCache = async () => {
    try {
        await sql`DISCARD ALL;`;
        console.log("PostgreSQL query plans have been discarded.");
    } catch (error) {
        console.error("Error discarding query plans:", error);
    }
};

export const clearCache = async (req: Request, res: Response) => {
   try {
       await clearQueryCache();
       return res.status(200).json({
           message: "Successfully cleared cache.",
       });
   } catch (error:any) {
       return res.status(500).json({
           message: "There was an error in clearing cache",
           error: error.message,
       });
   }
}
