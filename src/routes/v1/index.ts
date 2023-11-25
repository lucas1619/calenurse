import { Router } from "express";
import scheduleRouter from "./schedule";

const router = Router();

router.use("/schedule", scheduleRouter);

export default router;