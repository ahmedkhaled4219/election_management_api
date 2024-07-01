import { sendEmail } from "../emailing/confirmationOfEmail.js";
import { Citizen } from "../models/citizen.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { confirmEmail } from '../emailing/confirmationOfEmail.html.js'
import { sendForgetPasswordEmail } from "../emailing/forgetPasswordEmail.js";
import { validateSSN, extractSSNInfo } from '../utilities/ssnutils.js';
import crypto from 'crypto';
import { paginate, paginateArray } from "../utilities/pagination.js";
import { Candidate } from "../models/candidate.js";
import axios from "axios";



const signUp = catchAsyncErr(async (req, res) => {
  const { ssn, firstName, lastName, role, password, email, phoneNumber, motherSSN, motherName } = req.body;
  const image = req.file?.path;

  const validation = validateSSN(ssn);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  const { birthDate, age, governorate, gender } = extractSSNInfo(ssn);

  const existingCitizen = await Citizen.findOne({ ssn });
  if (existingCitizen) {
    return res.status(400).json({ message: 'SSN already exists.' });
  }

  const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).json({
      message: 'Password does not meet the complexity requirements. It should be 8-32 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    });
  }

  try {
    const axiosResponse = await axios.get('http://127.0.0.1:5000/citizens/', {
      params: {
        ssn,
        motherSSN,
        motherName
      }
    });
    if (axiosResponse.status !== 200) {
      return res.status(400).json({ message: axiosResponse.data.message });
    }
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ message: 'Error verifying motherSSN or motherName.' });
  }

  const hash = bcrypt.hashSync(password, Number(process.env.ROUND));

  const newCitizen = await Citizen.create({
    ssn,
    firstName,
    lastName,
    role,
    password: hash,
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
    return res.status(404).json({ message: "incorrect ssn or password" });
  }

  citizen["password"] = undefined;

  let tokenPayload = { citizen };

  if (citizen.role === 'candidate') {
    const candidate = await Candidate.findOne({ citizenId: citizen._id });
    tokenPayload.candidate = candidate;
  }

  var token = jwt.sign(tokenPayload, process.env.JWT_KEY);
  var role = citizen.role;
  res.json({ message: "login successfully", token, role });
});

export default signin;


const confirmationOfEmail = catchAsyncErr(async (req, res) => {
  let { token } = req.params;
  jwt.verify(token, process.env.JWT_KEY, async function (err, decoded) {
    if (!err) {
      await Citizen.findOneAndUpdate(
        { email: decoded.email },
        { emailConfirmation: true }
      );

      const htmlContent = `
        <html>
          <head>
            <title>Account Confirmation</title>
            <style>
              body {
                background-color: #f4fbf9;
                color: #585858;
                text-align: center;
                padding: 50px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
              }
              p {
                font-size: 18px;
                margin-bottom: 30px;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #20da9c;
                color: #fff;
                border-radius: 8px;
                text-decoration: none;
                font-size: 16px;
              }
              .button:hover {
                background-color: #17b887;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Account Confirmed</h1>
              <p>Your account has been successfully confirmed.</p>
              <a href="http://localhost:4200/login" class="button">Go to Login</a>
            </div>
          </body>
        </html>
      `;

      res.send(htmlContent);
    } else {
      res.status(400).send(`
        <html>
          <head>
            <title>Error</title>
            <style>
              body {
                background-color: #f4fbf9;
                color: #585858;
                text-align: center;
                padding: 50px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #ff4d4f;
              }
              p {
                font-size: 18px;
                margin-bottom: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Invalid or Expired Token</h1>
              <p>The link you used is invalid or has expired. Please try again.</p>
            </div>
          </body>
        </html>
      `);
    }
  });
});



export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const citizen = await Citizen.findOne({ email });
    if (!citizen) {
      return res.status(404).json({ message: 'citizen not found.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    const localResetExpiredDate = new Date(resetPasswordExpires.getTime() - (resetPasswordExpires.getTimezoneOffset() * 60000));

    // Save the token and expiration date to the citizen's record
    citizen.resetPasswordToken = resetToken;
    citizen.resetPasswordExpires = localResetExpiredDate;
    await citizen.save();

    // Send the reset token to the user's email
    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;
    await sendForgetPasswordEmail(email, 'Password Reset Request', `Please reset your password by clicking the following link: ${resetUrl}`);

    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error occurred while processing the password reset request.', error });
  }
};



export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const citizen = await Citizen.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!citizen) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Hash the new password and save it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    citizen.password = hashedPassword;
    citizen.resetPasswordToken = null;
    citizen.resetPasswordExpires = null;
    await citizen.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error occurred while resetting the password.', error });
  }
};


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

const showAllCitizens = catchAsyncErr(async (req, res) => {
  const { page, limit, status } = req.query;

  const paginationResults = await paginate(Citizen,   {
    status:status,
    role: 'notAdmin'
  }, page, 5);
  res.status(200).json({
    message: `Citizens with status '${status}' retrieved successfully`,
    paginationResults,
  });

});

const addAdmin = catchAsyncErr(async (req, res) => {
  const { ssn, firstName, lastName, password, email, phoneNumber, motherSSN, motherName } = req.body;
  const image = req.file?.path;

  const validation = validateSSN(ssn);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  const { birthDate, age, governorate, gender } = extractSSNInfo(ssn);

  const existingCitizen = await Citizen.findOne({ ssn });
  if (existingCitizen) {
    return res.status(400).json({ message: 'SSN already exists.' });
  }
  try {
    const axiosResponse = await axios.get('http://127.0.0.1:5000/citizens/', {
      params: {
        ssn,
        motherSSN,
        motherName
      }
    });
    if (axiosResponse.status !== 200) {
      return res.status(400).json({ message: axiosResponse.data.message });
    }
  } catch (error) {
    // console.log(error);
    return res.status(400).json({ message: 'Error verifying motherSSN or motherName.' });
  }
  const hash = bcrypt.hashSync(password, Number(process.env.ROUND));

  const newCitizen = await Citizen.create({
    ssn,
    firstName,
    lastName,
    role: "admin",
    password: hash,
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

  res.status(201).json({ message: "Admin Inserted successfully", citizen: newCitizen });
});
const updatedCitizenProfile = catchAsyncErr(async (req, res) => {
  const citizenId = req.citizen.citizen._id;

  const { ssn, firstName, lastName, role, password, email, phoneNumber } = req.body;
  const updateData = { ssn, firstName, lastName, role, email, phoneNumber };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const updatedCitizen = await Citizen.findByIdAndUpdate(citizenId, updateData, { new: true, runValidators: true });

  if (!updatedCitizen) {
    return res.status(404).json({ message: 'Citizen not found.' });
  }

  res.status(200).json({ message: 'Citizen updated successfully', citizen: updatedCitizen });
});

const showSpecificCitizen = catchAsyncErr(async (req, res) => {
  const citizenId = req.params.id;
  const citizen = await Citizen.findById({ _id: citizenId });
  if (!citizen) {
    return res.status(404).json({ message: 'Citizen not found.' });
  }
  res.status(200).json({ message: "citizen showd successfully", citizen });
});

const updateCitizen = catchAsyncErr(async (req, res) => {
  const citizenId = req.params.id;
  const updates = req.body;

  // Find the citizen by ID
  let citizen = await Citizen.findById(citizenId);

  if (!citizen) {
    return res.status(404).json({ message: 'Citizen not found.' });
  }

  // Update specific fields if they exist in req.body
  if (updates.firstName) {
    citizen.firstName = updates.firstName;
  }
  if (updates.lastName) {
    citizen.lastName = updates.lastName;
  }

  if (updates.email) {
    citizen.email = updates.email;
  }

  if (updates.phoneNumber) {
    citizen.phoneNumber = updates.phoneNumber;
  }
  // Save the updated citizen document
  await citizen.save();

  res.status(200).json({ message: 'Citizen updated successfully', citizen });
});
export const getApplicationStatus = catchAsyncErr(async (req, res) => {
  const { page , limit } = req.query;
  const citizenId = req.citizen.citizen._id;

  const citizen = await Citizen.findById(citizenId)
    .populate({
      path: 'applicationStatus.electionId',
      select: 'title description totalVotes startdate enddate',
    })
    .lean();

  if (!citizen) {
    return res.status(404).json({ message: 'Citizen not found.' });
  }
  console.log(citizen.status);
  if (citizen.status=="blocked") {
    return res.status(403).json({ message: 'Your account is blocked.' });
  }
  const applicationStatus = citizen.applicationStatus || [];
  const sortedStatus = applicationStatus.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const paginationResults = paginateArray(sortedStatus, page, limit);

  res.status(200).json({
    message: 'Application status retrieved successfully',
    ...paginationResults,
  });
});

export const getBlockedCitizens = catchAsyncErr(async (req , res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page-1) * limit;
  let count = await Citizen.find({status:"blocked"}).count();
  let citizen2 = await Citizen.find({status:"blocked"}).skip(skip).limit(limit);
  res.status(200).json({
    count:count,
    citizens:citizen2
  });
})

export {
  signUp, signin, confirmationOfEmail, updateCitizenStatus, showAllCitizens
  , addAdmin, updatedCitizenProfile, showSpecificCitizen, updateCitizen
};