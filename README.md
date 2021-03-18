# relationalai-sdk

RelationalAI SDK for JavaScript

## Installation

```
npm install relationalai-sdk
```

## Usage

```
import { LocalConnection } from 'relationalai-sdk';

const localConnection = new LocalConnection();
let res = await localConnection.connectToDatabase('dbname');
```
