import { Router } from "express";
import { check } from "express-validator";
import { getFacturas } from "./factura.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import { existeFacturaById } from "../helpers/db.validator.js";

const router = Router();

router.get("/", 
    [
        validarJWT,
        tieneRole("ADMIN_ROLE")
    ],  
    getFacturas
);


export default router;