# RaiDbSdk.DefaultApi

All URIs are relative to *http://127.0.0.1:8010*

Method | HTTP request | Description
------------- | ------------- | -------------
[**transactionPost**](DefaultApi.md#transactionPost) | **POST** /transaction | Issues a transaction to be executed



## transactionPost

> TransactionResult transactionPost(transaction)

Issues a transaction to be executed

### Example

```javascript
import RaiDbSdk from 'rai_db_sdk';

let apiInstance = new RaiDbSdk.DefaultApi();
let transaction = new RaiDbSdk.Transaction(); // Transaction | Optional description in *Markdown*
apiInstance.transactionPost(transaction, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction** | [**Transaction**](Transaction.md)| Optional description in *Markdown* | 

### Return type

[**TransactionResult**](TransactionResult.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

