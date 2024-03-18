import express from 'express';
import os from 'os';
const pm2 = require('pm2');

const app = express();

app.get('/', (req, res) => {
    pm2.connect(function (err: string) {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.describe(process.env.PROCESS_NAME, function (err: string, description: any) {
            if (err) {
                console.error(err);
                pm2.disconnect();
                return res.status(500).send('Error retrieving process description');
            }

            if (!description[0]) {
                console.error(`Process ${process.env.PROCESS_NAME} not found.`);
                pm2.disconnect();
                return res.status(404).send(`Process ${process.env.PROCESS_NAME} not found`);
            }

            const processInfo = description[0];

            res.json({
                cpu_usage: processInfo.monit.cpu,
                memory_usage: processInfo.monit.memory,
                server_name: os.hostname(),
                cpu_name: `${os.cpus().map((i) => i.model)[0]}`
            });

            pm2.disconnect();
        });
    });
});

// Start the server
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Express server is running at http://localhost:${port}`);
});
