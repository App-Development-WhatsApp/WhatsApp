import { Router } from "express";
import { registerUser,UploadFiles,GetAllUsers,getUserWithId, DeleteFiles } from "../controllers/user.controller";



import multer from "multer";

const router = Router();

router.route("/login").post(registerUser);
router.route("/getAllUsers").get(GetAllUsers);
router.route("/sendfile").post(UploadFiles)
router.route("/deletefile").post(DeleteFiles)
router.route("/getUserById/:id").post(getUserWithId);


export default router;
