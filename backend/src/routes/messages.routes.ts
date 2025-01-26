import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();


router.route("/").post((req, res) => {
    console.log("Sends a message in a specific chat.")
});

router.route("/:messageId").post(verifyJWT, () => {
    console.log("Edit message")
});
router.route("/:messageId").delete(() => {
    console.log("message deleted")
});


export default router;
