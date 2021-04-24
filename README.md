## RESTful-Notify.api
Simple Microservice API that allows push notifications on Linux running a Notfication Daemon.

---

### 📦 Dependancies
- `notify-send`: Be sure to have this package on your system. As this will interface with your Notification Daemon.
- `node`: Used to run the Express App

### 🔧 Setup
1) Run the [Generate RSA Key Script](scripts/generateSSHKeys.sh) to generate your RSA Keys
2) Copy the **key.private** file to the device that will sign the data
3) Configure the [Configuration File](src/config.ts) to accept a given IP and its associated **Public Key**
```typescript
// EXAMPLE
const config: IConfiguration = {
  '192.168.0.3': 'key.pem',
};
```
4) Sign and Issue notifications!!🚀

### ✨ Signing a Notification POST
```javascript
import axios from 'axios';
import * as Crypto from 'crypto';
import { readFileSync } from 'fs';
import { exit } from 'process';

// SIGN SOME DATA!
const privateKey = readFileSync('./key.private', 'utf-8');
const iconFile = Buffer.from(readFileSync('./someicon.png', 'binary'));

// Construct Data Packet
const data = {
  title:    'Some title',
  summary:  'Summary',
  body:     'A cool body',
  urgency:  'low',
  icon:     iconFile,
};

// Sign the Packet
const sign = Crypto.createSign('SHA256');
sign.update(JSON.stringify(data));
sign.end();
const signature = sign.sign(privateKey);


// ISSUE THAT REQUEST
// NOTE: URL and Port Varies depending on where the App is hosted
axios.post('http://192.168.0.2:3000/api/v1/notify', { 
  data,
  headers: {
    'Authorization': signature,
  }
})
  .then(res => res.data)
  .then(data => console.log(data))
  .catch(err => console.log('ERR', err.response.data));
```


### 🚀 Build & Run
```sh
# Builds and Runs the Application
npm start
```

### 📑 License
Licensed under the [MIT License](LICENSE).