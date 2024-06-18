import { Citizen } from "../models/citizen.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import bcrypt from "bcrypt";



const signUp = catchAsyncErr(async (req, res) => {
    const { ssn, firstName, lastName, role, password, image, email, phoneNumber } = req.body;
    const hash=bcrypt.hashSync(password, Number(process.env.ROUND))
    const newCitizen = await Citizen.create({
        ssn,
        firstName,
        lastName,
        role,
        password:hash,
        image,
        email,
        phoneNumber
    });

    res.status(201).json({ message: "Inserted successfully", citizen: newCitizen });
});

export {signUp};
