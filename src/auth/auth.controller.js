import Usuario from '../users/user.model.js';
import { hash, verify } from 'argon2';
import { generarJWT } from '../helpers/generate-jwt.js';

export const  login = async(req, res) => {
    const {email, password, username} = req.body;

    try {

        const user = await Usuario.findOne({
            $or: [{email}, {username}]
        }) 

        if(!user){
            return res.status(400).json({
                msg: 'Credenciales incorrectas, el correo electrónico no existe en la base de datos.'
            });
        }

        if(!user.estado){
            return res.status(400).json({
                msg: 'El usuario no existe en la base de datos.'
            });
        }

        const validPassword = await verify(user.password, password);
        if(!validPassword){
            return res.status(400).json({
                msg: 'La contraseña es incorrecta'
            })
        }

        const token = await generarJWT(user.id);

        res.status(200).json({
            msg: 'Inicio de sesión exitoso',
            userDetails: {
                username: user.username,
                token: token,
                profilePicture: user.profilePicture
            }
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "error del servidor",
            error: e.message
        })
    }
}

export const register = async (req, res) => {
    try {
        const { name, surname, username, email, password, role = 'CLIENT_ROLE' } = req.body;

        if (!name || !surname || !username || !email || !password) {
            return res.status(400).json({ message: "Faltan datos en la request" });
        }

        const existingUser = await Usuario.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Usuario ya existente en la base de datos" });
        }

        const encryptedPassword = await hash(password);

        const user = new Usuario({
            name,
            surname,
            username,
            email,
            password: encryptedPassword,
            role,
            estado: true
        });

        await user.save();

        return res.status(201).json({
            message: `El usuario ${user.name} fue registrado con exito!`,
            userDetails: {
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Hubo un error al registrar el usuario",
            error: error.message,
        });
    }
};
