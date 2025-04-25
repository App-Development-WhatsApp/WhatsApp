import { Router } from "express";
import { saveMessages } from "../controllers/message.controller";

const router = Router();

router.route("/messages").post(saveMessages);

export default router;
