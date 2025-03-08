import { Router } from "express";
import { check } from "express-validator";
import { addProductToCar, getCar, removeProductFromCar, pagarCar, historial, getMostPurchasedProducts  } from "./car.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
    "/car",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("productId", "Product ID is invalid!").isMongoId(),
        check("quantity", "Quantity must be a number").isInt({ gt: 0 }),
        validarCampos
    ],
    addProductToCar
);

router.get("/",
    validarJWT,
    getCar
);

router.delete(
    "/:productId",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("productId", "Product ID is invalid!").isMongoId(),
        validarCampos
    ],
    removeProductFromCar
);

router.get(
    "/:id",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        check("id", "id de carro es obligatorio y debe ser un ID válido").isMongoId(),
        validarCampos
    ],
    removeProductFromCar
);

router.post(
    "/pagarCar",
    [
        validarJWT,
        tieneRole("CLIENT_ROLE"),
        validarCampos
    ],
    pagarCar
);

router.get(
    "/frecuenciaCompra",
    getMostPurchasedProducts
);



router.get(
    "/historial/:id",
    
        validarJWT,
        historial
    
);

export default router;