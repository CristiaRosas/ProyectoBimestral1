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
        const { email } = req.body;
        const existingUser = await Usuario.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "El correo electrónico ya está registrado en la base de datos",
            });
        }

        const data = req.body;

        const encryptedPassword = await hash(data.password);

        const user = await Usuario.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email,
            phone: data.phone,
            password: encryptedPassword,
            role: data.role,
        });

        await user.save();

        return res.status(201).json({
            message: `El usuario ${user.name} fue registrado con éxito!`,
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

const createUserAdmin = async (name, surname, username, email, password, role) => {
    try {
        if (role === "ADMIN_ROLE" && await Usuario.exists({ role: "ADMIN_ROLE" })) return null;
        
        const newUser = new Usuario({
            name, 
            surname, 
            username, 
            email, 
            password: await hash(password),
            role
        });
        
        await newUser.save();
        console.log("Usuario admin por defecto creado exitosamente");
        return newUser;
    } catch (error) {
        console.error("Error creando usuario admin:", error);
        return null;
    }
};

createUserAdmin("Cristian", "Rosas", "Crosas", "crosas@gmail.com", "12345678", "ADMIN_ROLE");
