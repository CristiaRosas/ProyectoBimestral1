import Role from '../role/role.model.js'
import Usuario from '../users/user.model.js'
 
export const esRoleValido = async(role = '') =>{
    const existeRol = await Role.findOne({ role });
 
    if(!existeRol){
        throw new Error(`El role ${role} does not exist in the database`);
    }
   
}
 
export const existeEmail = async(correo = '') =>{
    const existeEmail = await Usuario.findOne({ correo });
 
    if(!existeEmail){
        throw new Error(`el correo electrónico ${correo} already exists in the database`)
    }
}

export const existeUsuarioById = async (id = '') => {
    const existeUsuario = await User.findById(id);

    if(!existeUsuario){
        throw new Error(`The ${id} does not exist`);
    }
}