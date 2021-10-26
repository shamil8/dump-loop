import { isLocal, } from '../config/constant';
import dumpLoop from './dumpLoop';

if (!isLocal) {
    console.log('\x1b[32m%s\x1b[0m', 'Dump loop started!');
    dumpLoop('06:27'); // timezone in your server!!!
}
