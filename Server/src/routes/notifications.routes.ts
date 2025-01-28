import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();


router.route("/:userId").post((req, res) => {
    console.log("all unread notifications for a user")
});

router.route("/:notificationId").post((req, res) => {
    console.log("Marks a notification as read.")
});


export default router;