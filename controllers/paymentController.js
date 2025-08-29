const { APIContracts, APIControllers } = require('authorizenet');
const { getMerchantAuth } = require('../utils/authorizeNet');

exports.makePayment = (req, res) => {
  let merchantAuthenticationType = getMerchantAuth();

  // Test card details (abhi hardcoded, baad me req.body se aayenge)
  let creditCard = new APIContracts.CreditCardType();
  creditCard.setCardNumber('4111111111111111');    //4111111111111111    //4111117777119999
  creditCard.setExpirationDate('2028-12');
  creditCard.setCardCode('123');

  let paymentType = new APIContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  let transactionRequestType = new APIContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount('10.00');

  let createRequest = new APIContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);

  let ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

  ctrl.execute(() => {
    let apiResponse = ctrl.getResponse();
    let response = new APIContracts.CreateTransactionResponse(apiResponse);

    if (response != null) {
      if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
        if (response.getTransactionResponse().getMessages() != null) {
          res.json({
            success: true,
            transactionId: response.getTransactionResponse().getTransId(),
            message: response.getTransactionResponse().getMessages().getMessage()[0].getDescription()
          });
        } else {
          res.json({ success: false, message: 'Transaction Failed, no messages.' });
        }
      } else {
        res.json({
            success: false,
            errorCode: response.getTransactionResponse().getErrors().getError()[0].getErrorCode(),
            errorText: response.getTransactionResponse().getErrors().getError()[0].getErrorText()
        });
      }
    } else {
      res.json({ success: false, message: 'Null response from Authorize.net' });
    }
  });
};
