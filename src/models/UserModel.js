import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  role: {
    type: String,
    enum: ['admin', 'guide', 'lead-guide', 'user'],
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valida email!'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide your password!'],
    minlength: 8,
    select: false, // password is not visible when get user details
  },
  // It works on save() or create() new user only, it is not available on updating user password
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your password!'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message:
        'The confirmation password is not equal to your previous password!',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

// encrypt the password
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//Filtered the deleted user from get all users or Id
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//created password changed time and save it to document after user changed the password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

//check the enteredPassword is the same as the password in the database during signi
userSchema.methods.correctPassword = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

//Check if the password has been changed :Instance
userSchema.methods.changePasswordAfter = function (JWTIssuedTime) {
  if (this.passwordChangeAt) {
    const changePasswordTime = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTIssuedTime < changePasswordTime;
  }
  return false;
};

//Create resetToken for reseting password via Schema Instant
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);

export default User;
