export const tieneRole = (...roles) => {
    return (req, res, next) => {
        if(!req.usuario){
            return res.status(500).json({
                success: false,
                msg: 'You want to verify a role without validating the token first'
            })
        }
        
        if (!roles.includes(req.usuario.role)){
            return res.status(401).json({
                success: false,
                msg: `Unauthorized user, has a role ${req.usuario.role}, the authorized roles are ${roles}`
            })
        }

        next();
    }
}