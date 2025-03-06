import {Router} from "express";
import { check } from "express-validator";
import { saveProducto, getProductoById, getProductoByName, updateProducto, deleteProduct, getProductos } from "./producto.controller.js";
import { existeCategoryById, existeProductByName } from "../helpers/db.validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
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

router.get(
    "/", 

    getProductos
)

router.get(
    "/getProductoById/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id",  "id invalid").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    getProductoById
)

router.get(
    "/getProductoByName/:name",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE", "CLIENT_ROLE"),
        check("name", "El nombre es requerido").not().isEmpty(),
        check("name").custom(existeProductByName),
        validarCampos
    ],
    getProductoByName
)

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id",  "id invalid").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    updateProducto
)

router.delete(
    "/deleteProduct/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id",  "id invalid").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    deleteProduct
)

export default router;