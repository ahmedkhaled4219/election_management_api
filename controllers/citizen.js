import { sendEmail } from "../emailing/confirmationOfEmail.js";
import { Citizen } from "../models/citizen.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {confirmEmail} from '../emailing/confirmationOfEmail.html.js'
import { validateSSN, extractSSNInfo } from '../utilities/ssnutils.js';



const signUp = catchAsyncErr(async (req, res) => {
    const { ssn, firstName, lastName, role, password, image, email, phoneNumber } = req.body;
    
    const validation = validateSSN(ssn);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const { birthDate, age, governorate, gender } = extractSSNInfo(ssn);
 
    const existingCitizen = await Citizen.findOne({ ssn });
    if (existingCitizen) {
        return res.status(400).json({ message: 'SSN already exists.' });
    }
   

    const hash=bcrypt.hashSync(password, Number(process.env.ROUND))
    
    const newCitizen = await Citizen.create({
        ssn,
        firstName,
        lastName,
        role,
        password:hash,
        image,
        email,
        phoneNumber,
        birthDate,
        age,
        governorate,
        gender
    });
    var token = jwt.sign({ email }, process.env.JWT_KEY);
    sendEmail({ email, html: confirmEmail(token) });
    
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

const confirmationOfEmail = catchAsyncErr(async (req, res) => {
    let { token } = req.params;
    jwt.verify(token, process.env.JWT_KEY, async function (err, decoded) {
      if (!err) {
        await Citizen.findOneAndUpdate(
          { email: decoded.email },
          { emailConfirmation: true }
        );
        res.json({ message: "account confirmed successfully" });
      } else {
        res.json(err);
      }
    });
  });
  const updateCitizenStatus = catchAsyncErr(async (req, res) => {
    const { citizenId, status } = req.body;

    if (!['blocked', 'unblocked'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "blocked" or "unblocked".' });
    }

    const updatedCitizen = await Citizen.findByIdAndUpdate(citizenId, { status }, { new: true });

    if (!updatedCitizen) {
        return res.status(404).json({ message: 'Citizen not found.' });
    }

    res.status(200).json({ message: `Citizen has been ${status}.`, citizen: updatedCitizen });
});
export {signUp,signin,confirmationOfEmail,updateCitizenStatus};

