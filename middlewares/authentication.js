
import jwt from 'jsonwebtoken'


export const isAuthenticated = (req, res, next) => {
    let token = req.header('token')
    jwt.verify(token, process.env.JWT_KEY , function (error, decoded) {
        if (err) {
            res.json({ error })
        } else {
            req = decoded
            next()
        }
    });
}
