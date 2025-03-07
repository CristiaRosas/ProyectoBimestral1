import { Router } from "express";
import { check } from "express-validator";
import { getFacturas, updateFactura } from "./factura.controller.js";
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

router.put(
    "/updateFactura/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id", "El id de la factura es obligatorio y debe ser válido").isMongoId(),
        check("estado", "El estado de la factura es obligatorio").not().isEmpty(),
        validarCampos,
        existeFacturaById
    ],
    updateFactura
)

export default router;