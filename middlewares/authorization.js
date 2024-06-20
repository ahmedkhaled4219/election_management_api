import { catchAsyncErr } from "../utilities/catchError.js";






export const allowedTo = (...roles) => {
    return catchAsyncErr(async (req, res, next) => {
        if (!req.citizen.citizen.emailConfirmation) {
            return res.status(403).json({ message: "Your email is not confirmed." });
        }
        if (!roles.includes(req.citizen.citizen.role)) {
            return res.status(403).json({ message: "You are not authorized. Your role is: " + req.citizen.citizen.role });
        }
        next();
    });
}
