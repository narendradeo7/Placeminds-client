const otpGenerator = require('otp-generator')



const genOtp =() =>{
const otp =otpGenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets: false, specialChars: false });

return otp;
}


module.exports =genOtp;