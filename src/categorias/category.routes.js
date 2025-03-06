import { Router } from "express";
import { check } from "express-validator";
import { saveCategorias, getCategorias, getCategoriasById, getProductsByCategory, updateCategory, deleteCategory} from "./category.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import { existeCategoryById } from "../helpers/db.validator.js";

const router = Router();
router.post(
    "/",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("nombre", "El nombre de la categoría es obligatorio").not().isEmpty(),
        validarCampos
    ],
    saveCategorias
)

router.get("/", 
    getCategorias
)

router.get(
    "/getCategoriasById/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id",  "id invalido").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    getCategoriasById
)

router.get(
    "/getProductsByCategory/:name",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("name",  "nombre de la categoría es obligatorio").not().isEmpty(),
        check("name").custom(existeCategoryById),
        validarCampos
    ],
    getProductsByCategory
)

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN_ROLE"),
        check("id",  "id invalido").isMongoId(),
        check("id").custom(existeCategoryById),
        validarCampos
    ],
    updateCategory
)

router.delete(
     "/:id",
     [
         validarJWT,
         tieneRole("ADMIN_ROLE"),
         check("id",  "id invalido").isMongoId(),
         check("id").custom(existeCategoryById),
         validarCampos
     ],
     deleteCategory
)

export default router;
