import {Router} from "express";
import { check } from "express-validator";
import { saveProducto, getProductoById, getProductoByName, updateProducto, deleteProduct } from "./producto.controller";
import { existeCategoryById, existeProductByName } from "../helpers/db.validator";
import { validarCampos } from "../middlewares/validar-campos";
import { validarJWT } from "../middlewares/validar-jwt";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id",  "id invalid").isMongoId(),
        validarCampos
    ],
    saveProducto
)