"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.route("/:userId").post((req, res) => {
    console.log("all unread notifications for a user");
});
router.route("/:notificationId").post((req, res) => {
    console.log("Marks a notification as read.");
});
exports.default = router;
