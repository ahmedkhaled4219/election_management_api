import { Citizen } from "../models/citizen.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



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
const signin = catchAsyncErr(async (req, res) => {
    const { ssn, password } = req.body;
    let citizen = await Citizen.findOne({ ssn });
  
    if (!citizen || !(await bcrypt.compare(password, citizen.password))) {
      return res.json({ message: "incorrect ssn or password" });
    }
    citizen["password"] = undefined;
    var token = jwt.sign({ citizen }, process.env.JWT_KEY);
    var role=citizen.role;
    res.json({ message: "login successfully", token,role });
  });
export {signUp,signin};
