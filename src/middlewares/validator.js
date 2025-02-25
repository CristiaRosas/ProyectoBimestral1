import { body } from 'express-validator';
import { validarCampos } from './validar-campos.js';
import { existeEmail, esRoleValido } from '../helpers/db.validator.js';


export const registerValidator = [
    body('name', 'The name is required').not().isEmpty(),
    body('surname', 'The surname is rquired').not().isEmpty(),
    body('email', 'You must enter a valid email').isEmail(),
    body('email').custom(existeEmail),
    body('role').custom(esRoleValido),
    body('password', 'password must be at least o characters').isLength({ min: 6}),
    validarCampos,
];

export const loginValidator = [
    body('email').optional().isEmail().withMessage("Enter a valid email adress"),
    body('username').optional().isEmail().isString().withMessage("Entert a valid usernamea"),
    body('password', "Password must be at least 6 characters").isLength({min: 8}),
    validarCampos,
]