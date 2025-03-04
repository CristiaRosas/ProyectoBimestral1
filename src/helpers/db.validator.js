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
        throw new Error(`El ${id} no existe`);
    }
}

export const existeProductById = async (id = '') => {
    const existeProduct = await Product.findById(id);

    if (!existeProduct) {
        throw new Error(`id ${id} no existe!`);
    }
}

export const existeProductByName = async (name = '') => {
    const existeProduct = await Product.findById(name);

    if (!existeProduct) {
        throw new Error(`nombre ${name} no existe!`);
    }
}

export const existeCategoryById = async (id = '') => {
    const existeCategory = await Category.findById(id);

    if (!existeCategory) {
        throw new Error(`id ${id} no existe!`);
    }
}

export const existeFacturaById = async (id = '') => {
    const existeFactura = await Factura.findById(id);

    if (!existeFactura) {
        throw new Error(`id ${id} no existe!`);
    }
}