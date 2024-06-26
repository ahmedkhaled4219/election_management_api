import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
    const token = req.header('token');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        } 

        req.citizen = decoded;
        if (!req.citizen || !req.citizen.emailConfirmation) {
            return res.status(403).json({ message: "Your email is not confirmed." });
        }

        next();
    });
};
