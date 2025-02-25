import {Router} from "express";
import {check} from "express-validator";
import { updateUser, updatePassword, getUserById} from './user.controller.js';
import {existeUsuarioById} from '../helpers/db.validator.js';
import {validarCampos} from '../middlewares/validar-campos.js';


const router = Router();


router.get(
    "/BuscarUser/:id",
    [
        check("id", "It is not a valid Id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    getUserById
)

router.put(
    "/:id",
    [
        check("id", "It is Not a valid Id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updateUser
)



router.put(
    "/passwordUpdate/:id",
    [
        check("id", "It is not a valid Id").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    updatePassword
) 


export default router;