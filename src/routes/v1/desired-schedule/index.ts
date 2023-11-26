import { Router } from "express";
import { Request, Response } from "express";

import { myDataSource } from "../../../app-data-source";

const router = Router();

router.post("/make", (req : Request, res : Response) => {
    try {
        const { area_id } = req.body;
        let date = new Date();
        const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
        const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);

        res.json({message: "success", data: {
            monday: monday,
            sunday: sunday
        }});
    } catch (error) {
        res.json({message: "error", data: error});
    }
});

export default router;