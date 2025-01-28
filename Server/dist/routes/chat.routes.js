"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.route("/").post((req, res) => {
    console.log("chat created");
});
router.route("/:userId").get(auth_middleware_1.verifyJWT, () => {
    console.log("chat fetched");
});
router.route("/:chatId/messages").get(() => {
    console.log("chat messages fetched");
});
router.route("/:chatId").delete(() => {
    console.log("chat deleted");
});
// group
router.route("/group").get(() => {
    console.log("Group created");
});
router.route("/:groupId").get(() => {
    console.log("Retrieves details of a specific group, including members.");
});
router.route("/group/:chatId").get(auth_middleware_1.verifyJWT, () => {
    console.log("chat fetched");
});
router.route("/group/:chatId/leave").get(auth_middleware_1.verifyJWT, () => {
    console.log("chat fetched");
});
router.route("/:groupId/members").post(auth_middleware_1.verifyJWT, () => {
    console.log("Adds a new member to a group");
});
router.route("/:groupId/members/:memberId").post(auth_middleware_1.verifyJWT, () => {
    console.log("Removes a member from a group.");
});
// Additional features
router.route("/:chatId/messages/read").get(auth_middleware_1.verifyJWT, () => {
    console.log("Read messages");
});
router.route("/:userId/unread").get(auth_middleware_1.verifyJWT, () => {
    console.log("Unread messages");
});
exports.default = router;
