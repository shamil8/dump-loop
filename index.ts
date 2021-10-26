import { exec, } from 'child_process';
import { sleep, } from './misc';
import config from '../config/config';

const path = '../dumps_db';
const [dbName] = config.dbLink.match(/\w+$/g);

export default async (sleepTime = '22:00', saveLast = 5): Promise<void> => {
    const isLoop = true;
    let isDiff = false;

    console.log('dbName', dbName);

    while (isLoop) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const sleepDate = new Date(`${dateStr}T${sleepTime}`).getTime();
        const diff = sleepDate - today.getTime();

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

        await sleep(diff);

        isDiff = true;
    }
};
