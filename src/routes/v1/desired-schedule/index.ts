import { Router } from "express";
import { Request, Response } from "express";

import { myDataSource } from "../../../app-data-source";

const router = Router();

router.post("/make", (req : Request, res : Response) => {
    try {
        const { date, shift } = req.body;
        
        // res.json({message: "success", data: {
        //     monday: monday,
        //     sunday: sunday
        // }});
    } catch (error) {
        res.json({message: "error", data: error});
    }
});

export default router;