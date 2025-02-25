import { Router } from "express";
import { login, registerUser } from "./auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/validator.js";
import { deleteFileOnError } from "../middlewares/deleteFileOnErros.js";
 
const router = Router();
 
router.post(
    '/login',
    loginValidator,
    login
);
 
router.post(
    '/registerUser',
    registerValidator,
    deleteFileOnError,
    registerUser
);
 
 
export default router;