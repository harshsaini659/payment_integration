const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  email: String,
  merchantCustomerId: String,
  customerProfileId: String,
  customerPaymentProfileIds: [String]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
