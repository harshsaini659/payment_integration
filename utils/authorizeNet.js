const { APIContracts } = require('authorizenet');

function getMerchantAuth() {
  let merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(process.env.API_LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

  return merchantAuthenticationType;
}

module.exports = { getMerchantAuth };
