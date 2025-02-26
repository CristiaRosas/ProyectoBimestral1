export const tieneRole = (...roles) => {
    return (req, res, next) => {
        if(!req.usuario){
            return res.status(500).json({
                success: false,
                msg: 'Quieres verificar un rol sin validar primero el token'
            })
        }
        
        if (!roles.includes(req.usuario.role)){
            return res.status(401).json({
                success: false,
                msg: `Usuario no autorizado, tiene un rol ${req.usuario.role}, los roles autorizados son ${roles}`
            })
        }

        next();
    }
}