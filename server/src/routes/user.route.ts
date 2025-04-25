import { Router } from "express";
import { registerUser,UploadFiles,GetAllUsers,getUserWithId } from "../controllers/user.controller";



import multer from "multer";

const router = Router();

router.route("/login").post(registerUser);
router.route("/getAllUsers").get(GetAllUsers);
router.route("/send_File").post(UploadFiles)
router.route("/getUserById/:id").post(getUserWithId);


export default router;
