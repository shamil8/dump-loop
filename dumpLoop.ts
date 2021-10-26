import { exec, } from 'child_process';
import { sleep, } from './misc';
import config from '../config/config';

const [dbName] = config.dbLink.match(/\w+$/g);
const sleepDays = 86400000; // one day

export default async (sleepTime = '22:00', saveLast = 5): Promise<void> => {
    const path = `../dumps_${dbName}`;
    const isLoop = true;
    let isDiff = false;

    console.log('Dump path from root app:', path);

    while (isLoop) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const sleepDate = new Date(`${dateStr}T${sleepTime}`).getTime();
        const diff = sleepDate - today.getTime();

        console.log('dateStr:', dateStr, 'sleepDate:', sleepDate, 'difff:', diff);

        try {
            isDiff && exec(`mkdir -p "${path}" && pg_dump ${config.dbLink} > "${path}/${dbName}_${dateStr}.sql"`,
                (err, out) => {
                    err && console.error(err);

                    console.log('stdout', out, 'Try to remove old dumps!');

                    exec(`ls ${path}/*.sql -A1 | sort`, (err, stdout) => {
                        err && console.error(err);

                        const files = stdout.split('\n').filter((f) => !!f);

                        files.splice(files.length - saveLast, saveLast);

                        const fileNames = files.join(' ');

                        exec(`rm -f ${fileNames}`, (err) => {
                            err && console.error(err);

                            console.log('Removed these files', fileNames);
                        });
                    });
                });
        }
        catch (e) {
            console.error('Error in dumpLoop', e);
        }

        await sleep(isDiff && diff <= 0 ? sleepDays : diff);

        isDiff = true;
    }
};
