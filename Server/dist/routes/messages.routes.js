"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.route("/").post((req, res) => {
    console.log("Sends a message in a specific chat.");
});
router.route("/:messageId").post(auth_middleware_1.verifyJWT, () => {
    console.log("Edit message");
});
router.route("/:messageId").delete(() => {
    console.log("message deleted");
});
exports.default = router;
