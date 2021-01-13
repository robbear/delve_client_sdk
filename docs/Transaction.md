# RaiDbSdk.Transaction

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**abort** | **Boolean** |  | [default to false]
**actions** | [**[LabeledAction]**](LabeledAction.md) |  | [optional] 
**dbname** | **String** |  | [default to &#39;&#39;]
**debugLevel** | **Number** |  | [optional] 
**mode** | **String** |  | [default to &#39;OPEN&#39;]
**readonly** | **Boolean** |  | [default to false]
**sourceDbname** | **String** |  | [optional] 
**version** | **Number** |  | [optional] 
**type** | **String** |  | [default to &#39;Transaction&#39;]



## Enum: ModeEnum


* `OPEN` (value: `"OPEN"`)

* `CREATE` (value: `"CREATE"`)

* `CREATE_OVERWRITE` (value: `"CREATE_OVERWRITE"`)

* `OPEN_OR_CREATE` (value: `"OPEN_OR_CREATE"`)

* `CLONE` (value: `"CLONE"`)

* `CLONE_OVERWRITE` (value: `"CLONE_OVERWRITE"`)





## Enum: TypeEnum


* `Transaction` (value: `"Transaction"`)




