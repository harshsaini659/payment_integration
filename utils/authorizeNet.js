const { APIControllers, APIContracts, Constants } = require('authorizenet');


//jab bhi koi customer koi transaction karne ja raha hota hai to usse phle authorize.net check karta hai merchant
//sahi hai ya nahi to ye puchta hai bhai tu kon hai tere pass valid loginID or key hai to ye function vahi validate kar raha hai
function getMerchantAuth() {
  let merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(process.env.API_LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

  return merchantAuthenticationType;
}

function getController(createRequest) {
  const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
  // force sandbox for all controllers (use correct controller type when needed)
  ctrl.setEnvironment(Constants.endpoint.sandbox);   //ye kbhi-kbhi production le leta hai isko force main sanbox karna padta hai
  return ctrl;
}

module.exports = { getMerchantAuth, getController };
