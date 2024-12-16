import stringify from 'safe-stable-stringify';
import { IObjectHasher } from './hash-object.interface';
import { createHash } from 'crypto';

export class ObjectMd5Hasher implements IObjectHasher {
  makeHash(obj: object) {
    const stringified = stringify(obj);
    return createHash('md5').update(stringified).digest('hex');
  }
}
