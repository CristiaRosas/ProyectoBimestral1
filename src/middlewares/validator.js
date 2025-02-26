import { body } from 'express-validator';
import { validarCampos } from './validar-campos.js';
import { existeEmail, esRoleValido } from '../helpers/db.validator.js';


export const registerValidator = [
    body('name', 'El nombre es requerido').not().isEmpty(),
    body('surname', 'El apellido es obligatorio.').not().isEmpty(),
    body('email', 'Debes ingresar un correo electrónico válido').isEmail(),
    body('email').custom(existeEmail),
    body('role').custom(esRoleValido),
    body('password', 'la contraseña debe tener al menos o caracteres').isLength({ min: 6}),
    validarCampos,
];

export const loginValidator = [
    body('email').optional().isEmail().withMessage("Introduzca una dirección de correo electrónico válida"),
    body('username').optional().isEmail().isString().withMessage("Ingrese un nombre de usuario válido"),
    body('password', "La contraseña debe tener al menos 6 caracteres.").isLength({min: 8}),
    validarCampos,
]