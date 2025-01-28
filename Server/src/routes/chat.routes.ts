import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/").post((req, res) => {
    console.log("chat created")
});

router.route("/:userId").get(verifyJWT, () => {
    console.log("chat fetched")
});
router.route("/:chatId/messages").get(() => {
    console.log("chat messages fetched")
});
router.route("/:chatId").delete(() => {
    console.log("chat deleted")
});

// group
router.route("/group").get(() => {
    console.log("Group created")
});
router.route("/:groupId").get(() => {
    console.log("Retrieves details of a specific group, including members.")
});

router.route("/group/:chatId").get(verifyJWT, () => {
    console.log("chat fetched")
});
router.route("/group/:chatId/leave").get(verifyJWT, () => {
    console.log("chat fetched")
});
router.route("/:groupId/members").post(verifyJWT, () => {
    console.log("Adds a new member to a group")
});
router.route("/:groupId/members/:memberId").post(verifyJWT, () => {
    console.log("Removes a member from a group.")
});



// Additional features

router.route("/:chatId/messages/read").get(verifyJWT, () => {
    console.log("Read messages")
});

router.route("/:userId/unread").get(verifyJWT, () => {
    console.log("Unread messages")
});
export default router;
