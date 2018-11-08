#!/usr/bin/env node

const path = require('path');

const sync = require('./sync');
const backup = require('./backup');
const program = require('commander');

function resolveHome(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return path.resolve(filepath);
}

program
    .option('-u, --url <url>', 'Connection URL of MongoDB')
    .option('-d, --database <database>', 'Which database to sync indexes');

program
    .command('backup')
    .option('-f, --file <file>', 'Path to file to backup indexes')
    .action(async opts => {
        await backup({
            file: resolveHome(opts.file),
            url: opts.parent.url,
            database: opts.parent.database,
        });

        process.exit();
    });

program
    .command('sync')
    .option('--drop', 'Whether to drop indexes in the live database which do not exist in the file (default is to not drop).')
    .option('--dry', 'Only describe what changes would be made without actually applying them')
    .option('-f, --file <file>', 'Path to file which contains db.collection.ensureIndex calls')
    .action(async opts => {
        await sync({
            file: resolveHome(opts.file),
            url: opts.parent.url,
            database: opts.parent.database,
            drop: opts.drop,
            dry: opts.dry
        });

        process.exit();
    });

program.parse(process.argv);


