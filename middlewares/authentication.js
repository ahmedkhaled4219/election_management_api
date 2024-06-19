
import jwt from 'jsonwebtoken'


export const isAuthenticated = (req, res, next) => {
    let token = req.header('token')
    jwt.verify(token, process.env.JWT_KEY , function (err, decoded) {
        if (err) {
            res.json({ err })
        } else {
            req.citizen = decoded
            next()
        }
    });
}
