function validateSSN(ssn) {
  if (!/^\d{14}$/.test(ssn)) {
    return { valid: false, message: "SSN must be 14 digits." };
  }

  const century = parseInt(ssn[0]);
  if (century !== 2 && century !== 3) {
    return { valid: false, message: "Invalid century indicator." };
  }

  const year = parseInt(ssn.substring(1, 3));
  const month = parseInt(ssn.substring(3, 5));
  const day = parseInt(ssn.substring(5, 7));

  if (month < 1 || month > 12) {
    return { valid: false, message: "Invalid month." };
  }

  if (day < 1 || day > 31) {
    return { valid: false, message: "Invalid day." };
  }

  const governorateCode = parseInt(ssn.substring(7, 9));
  const validGovernorateCodes = [
    1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27,
    28, 29, 31, 32, 33, 34, 35, 88,
  ];
  if (!validGovernorateCodes.includes(governorateCode)) {
    return { valid: false, message: "Invalid governorate code." };
  }

  const { birthDate, age } = extractSSNInfo(ssn);
  if (age < 18) {
    return { valid: false, message: "Age must be 18 or older." };
  }

  return { valid: true, message: "Valid SSN." };
}

function extractSSNInfo(ssn) {
  const century = parseInt(ssn[0]);
  const year = parseInt(ssn.substring(1, 3));
  const month = parseInt(ssn.substring(3, 5));
  const day = parseInt(ssn.substring(5, 7));

  const birthYear = (century === 2 ? 1900 : 2000) + year;
  const birthDate = new Date(Date.UTC(birthYear, month - 1, day));

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();

  const now = new Date();
  const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  let age = nowUTC.getUTCFullYear() - birthDate.getUTCFullYear();
  if (
    nowUTC.getUTCMonth() < birthDate.getUTCMonth() ||
    (nowUTC.getUTCMonth() === birthDate.getUTCMonth() && nowUTC.getUTCDate() < birthDate.getUTCDate())
  ) {
    age--;
  }

  const governorateCode = parseInt(ssn.substring(7, 9));
  const genderIndicator = parseInt(ssn[12]);
  const gender = genderIndicator % 2 === 0 ? "Female" : "Male";

  const governorateMap = {
    1: "Cairo",
    2: "Alexandria",
    3: "Port Said",
    4: "Suez",
    11: "Damietta",
    12: "Dakahlia",
    13: "Sharkia",
    14: "Qalyubia",
    15: "Kafr El Sheikh",
    16: "Gharbia",
    17: "Monufia",
    18: "Beheira",
    19: "Ismailia",
    21: "Giza",
    22: "Beni Suef",
    23: "Fayoum",
    24: "Minya",
    25: "Asyut",
    26: "Sohag",
    27: "Qena",
    28: "Aswan",
    29: "Luxor",
    31: "Red Sea",
    32: "New Valley",
    33: "Matrouh",
    34: "North Sinai",
    35: "South Sinai",
    88: "Foreign or Unknown",
  };
  const governorate = governorateMap[governorateCode];

  return { birthDate, age, governorate, gender };
}

export{
  validateSSN,
  extractSSNInfo,
};
