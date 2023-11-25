import { Router } from "express";
import scheduleRouter from "./schedule";
import authRouter from "./auth";

const router = Router();

router.use("/schedule", scheduleRouter);
router.use("/auth", authRouter)

export default router;