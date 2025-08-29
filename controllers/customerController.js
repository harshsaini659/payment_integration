// controllers/customerController.js
const { APIContracts, APIControllers, Constants } = require('authorizenet');
const { getMerchantAuth } = require('../utils/authorizeNet');
const Customer = require('../models/Customer');  

exports.createCustomerProfile = async (req, res) => {
  try {
    const { email, merchantCustomerId, cardNumber, exp, cvv } = req.body;

    if (!cardNumber || !exp || !cvv) {
      return res.status(400).json({ success: false, message: 'cardNumber, exp and cvv required' });
    }

    const merchantAuthenticationType = getMerchantAuth();

    // credit card
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(exp); // e.g. "2028-12"
    creditCard.setCardCode(cvv);

    const payment = new APIContracts.PaymentType();
    payment.setCreditCard(creditCard);

    // customerPaymentProfile
    const customerPaymentProfile = new APIContracts.CustomerPaymentProfileType();
    customerPaymentProfile.setCustomerType(APIContracts.CustomerTypeEnum.INDIVIDUAL);
    customerPaymentProfile.setPayment(payment);

    // customerProfile
    const customerProfile = new APIContracts.CustomerProfileType();
    customerProfile.setMerchantCustomerId(merchantCustomerId || `m_${Date.now()}`);
    customerProfile.setEmail(email || 'test@example.com');
    customerProfile.setPaymentProfiles([customerPaymentProfile]);

    // create request
    const createRequest = new APIContracts.CreateCustomerProfileRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setProfile(customerProfile);
    createRequest.setValidationMode(APIContracts.ValidationModeEnum.TEST_MODE);

    const ctrl = new APIControllers.CreateCustomerProfileController(createRequest.getJSON());
    ctrl.setEnvironment(Constants.endpoint.sandbox);

    ctrl.execute(async () => {
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.CreateCustomerProfileResponse(apiResponse);

      if (response != null) {
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const customerProfileId = response.getCustomerProfileId()
            ? response.getCustomerProfileId()
            : null;
          const paymentProfileList = response.getCustomerPaymentProfileIdList()
            ? response.getCustomerPaymentProfileIdList().getNumericString()
            : null;

            if (!Array.isArray(paymentProfileList)) {
                paymentProfileList = [paymentProfileList];
            }

          // 👇 DB me save karo
          const newCustomer = new Customer({
            email,
            merchantCustomerId,
            customerProfileId,
            customerPaymentProfileIds: paymentProfileList
          });

          await newCustomer.save();

          return res.json({
            success: true,
            customerProfileId,
            customerPaymentProfileIds: paymentProfileList,
            message: response.getMessages().getMessage()[0].getText()
          });
        } else {
          const msg = response.getMessages().getMessage()[0];
          return res.status(400).json({ success: false, code: msg.getCode(), message: msg.getText() });
        }
      } else {
        return res.status(500).json({ success: false, message: 'Null response from gateway' });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
