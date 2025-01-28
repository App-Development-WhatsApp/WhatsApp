"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.route("/register").post(
// we can use upload.array but it will only take same type
multer_middleware_1.upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]), user_controller_1.registerUser);
router.route("/login").post(user_controller_1.loginUser);
// logout is the controller for logout route and verifyJWT is the method want to run before perform logout
router.route("/logout").post(auth_middleware_1.verifyJWT, user_controller_1.logoutUser);
router.route("/refresh-token").post(user_controller_1.refreshAccessToken);
router.route("/change-password").post(auth_middleware_1.verifyJWT, user_controller_1.changeCurrentPassword);
router.route("/current-user").post(auth_middleware_1.verifyJWT, user_controller_1.getCurrentUser);
router.route("/update-account").patch(auth_middleware_1.verifyJWT, user_controller_1.updateAccountdetails);
router
    .route("/avatar")
    .patch(auth_middleware_1.verifyJWT, multer_middleware_1.upload.single("avatar"), user_controller_1.updateUserAvatar);
router
    .route("/cover-image")
    .patch(auth_middleware_1.verifyJWT, multer_middleware_1.upload.single("coverImage"), user_controller_1.updateUserCoverImage);
router.route("/c/:username").get(auth_middleware_1.verifyJWT, user_controller_1.getuserChannelProfile);
router.route("/history").get(auth_middleware_1.verifyJWT, user_controller_1.getWatchHistory);
exports.default = router;
