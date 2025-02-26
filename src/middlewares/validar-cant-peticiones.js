import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        succes: false,
        msg: 'Demasiadas solicitudes de esta IP. Vuelva a intentarlo después de 15 minutos.'
    }
    
})

export default limiter;