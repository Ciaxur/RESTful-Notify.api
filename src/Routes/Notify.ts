// Libraries used
import * as Crypto from 'crypto';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as temp from 'temp';
import { INotifyMessage, NotifySchema } from '../Schema/NotifyMessage';
import Config from '../config';

// Setup Router
import { Router } from 'express';
export const app = Router();

// Setup/Config Packages
temp.track();

// Request Interface
interface BodyRequest {
  data: INotifyMessage,
  headers: {
    Authorization: {
      type: string,
      data: Buffer | string,
    }
  },
}

// Setup Routes for Notify
app.post('/', async (req, res) => {
  // Obtain Address of Requestee & their IP
  const ip_split = req.ip.split(':');
  const ipAddress = ip_split[ip_split.length - 1];
  const publicKeyName = Config[ipAddress];
  const keyPath = join(__dirname, '..', '..', 'keys');

  // Validate Key is Stored
  if (!publicKeyName) {
    return res.status(404).json({
      message: 'IP is not stored here. Try somehwere else :)',
    });
  }
  
  // Obtain the Public Key
  const publicKey = readFileSync(join(keyPath, publicKeyName), 'utf-8');


  // Verify the Packet
  try {
    const { data, headers } = req.body as BodyRequest;
    const signature = headers.Authorization ? Buffer.from(headers.Authorization.data) : null;

    // Verify Signature
    const verify = Crypto.createVerify('SHA256');
    verify.update(JSON.stringify(data));
    verify.end();

    if (signature === null || !verify.verify(publicKey, signature))
      throw new Error('Invalid Signature');

    // Validate Correct Expected Data
    if (data.icon && (data.icon as any).type && (data.icon as any).type === 'Buffer') {
      if ((data.icon as any).data) {
        data.icon = Buffer.from((data.icon as any).data);
      }
    }

    // Validate Schema
    const { error } = NotifySchema.validate(data);
    if (error)
      return res.status(400).json({ message: 'Invalid Expected Data given!', error });


    // Save Icon to temp File!
    const tempStream = temp.createWriteStream();
    writeFileSync(tempStream.path, data.icon.toString(), { encoding: 'binary' });
      
    // All good! Execute Notification!
    const notifyScriptPath = join(__dirname, '..', '..', 'scripts', 'active-session-notify-send.sh');
    const cmd_args = [ 
      '-a', `${data.title}`,
      `${data.summary}`,
      `${data.body}`,
    ];
    const icon_args = data.icon ? [ '-i', tempStream.path.toString() ] : [];
    
    console.log([...icon_args, ...cmd_args]);
    const notifyBin = spawn(notifyScriptPath, [ ...icon_args, ...cmd_args ]);
    
    await (new Promise((resolve, reject) => {
      notifyBin.stdout.on('close', resolve);
      notifyBin.stderr.on('error', reject);
    }))
      .then(() => res.status(200).json({ message: 'Notified! 🚀' }))
      .catch(err => res.status(500).json({ error: err }))
      .finally(() => {   // Clean up
        tempStream.end();
        temp.cleanupSync();
      });

  } catch (e) {
    return res
      .status(401)  // Unauthorized
      .json({ message: 'Signnature Verification Failed!' });
  }

});
