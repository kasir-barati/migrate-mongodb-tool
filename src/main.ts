#! /usr/bin/env node

// https://github.com/bdcorps/migrate-mongo

import { program } from 'commander';
import _ from 'lodash';
import Table from 'cli-table3';

import packageJson from '../package.json';
import { Item } from './types/item.type';
import { ConfigMigrateMongodbUtil } from './utils/config.util';
import {
    CreateMigration,
    DowngradeDatabase,
} from './actions';
import { InitializeMigration } from './actions/init';
import { Database } from './utils/database.util';
import { UpgradeDatabase } from './actions/up';
import { MigrationStatus } from './actions/status';
import { MigrationDirectory } from './utils/migration-directory.util';

export class Main {
    private readonly configMigrateMongodbUtil: ConfigMigrateMongodbUtil;
    private readonly createMigration: CreateMigration;
    private readonly initializeMigration: InitializeMigration;
    private readonly database: Database;
    private readonly upgradeDatabase: UpgradeDatabase;
    private readonly downgradeDatabase: DowngradeDatabase;
    private readonly migrationStatus: MigrationStatus;

    constructor() {
        this.configMigrateMongodbUtil =
            new ConfigMigrateMongodbUtil();
        const migrationDirectory = new MigrationDirectory(
            this.configMigrateMongodbUtil,
        );
        this.createMigration = new CreateMigration(
            migrationDirectory,
        );
        this.initializeMigration = new InitializeMigration(
            migrationDirectory,
            this.configMigrateMongodbUtil,
        );
        this.database = new Database(
            this.configMigrateMongodbUtil,
        );
        this.upgradeDatabase = new UpgradeDatabase(
            this.migrationStatus,
            this.configMigrateMongodbUtil,
            migrationDirectory,
        );
        this.downgradeDatabase = new DowngradeDatabase(
            this.migrationStatus,
            migrationDirectory,
            this.configMigrateMongodbUtil,
        );
        this.migrationStatus = new MigrationStatus(
            migrationDirectory,
            this.configMigrateMongodbUtil,
        );
    }

    printMigrated(migrated: any[] = []) {
        migrated.forEach((migratedItem) => {
            console.log(`MIGRATED UP: ${migratedItem}`);
        });
    }

    handleError(err: Error) {
        console.error(`ERROR: ${err.message}`, err.stack);
        process.exit(1);
    }

    printStatusTable(statusItems: Item[]) {
        return this.configMigrateMongodbUtil
            .read()
            .then((config) => {
                const useFileHash =
                    config.useFileHash === true;
                const table = new Table({
                    head: useFileHash
                        ? ['Filename', 'Hash', 'Applied At']
                        : ['Filename', 'Applied At'],
                });
                statusItems.forEach((item) =>
                    table.push(_.values(item)),
                );
                console.log(table.toString());
            });
    }

    init() {
        program.version(packageJson.version);

        program
            .command('init')
            .description(
                'Initialize a new migration project',
            )
            .action(() =>
                this.initializeMigration
                    .init()
                    .then(() =>
                        console.log(
                            `Initialization successful. Please edit the generated \`${this.configMigrateMongodbUtil.getConfigFilename()}\` file`,
                        ),
                    )
                    .catch((err) => this.handleError(err)),
            );

        program
            .command('create [description]')
            .description(
                'create a new database migration with the provided description',
            )
            .option(
                '-f --file <file>',
                'use a custom config file',
            )
            .action((description: string, options: any) => {
                global.options = options;
                this.createMigration
                    .create(description)
                    .then((fileName) => {
                        const config =
                            this.configMigrateMongodbUtil
                                .customConfigContent;
                        console.log(
                            `Created: ${config.migrationsDir}/${fileName}`,
                        );
                    })
                    .catch((err) => this.handleError(err));
            });

        program
            .command('up')
            .description(
                'run all pending database migrations',
            )
            .option(
                '-f --file <file>',
                'use a custom config file',
            )
            .action((options: any) => {
                global.options = options;
                this.database
                    .connect()
                    .then(({ db, client }) =>
                        this.upgradeDatabase.up(db, client),
                    )
                    .then((migrated) => {
                        this.printMigrated(migrated);
                        process.exit(0);
                    })
                    .catch((err) => {
                        this.handleError(err);
                        this.printMigrated(err.migrated);
                    });
            });

        program
            .command('down')
            .description(
                'undo the last applied database migration',
            )
            .option(
                '-f --file <file>',
                'use a custom config file',
            )
            .action((options: ConfigOption) => {
                global.options = options;
                this.database
                    .connect()
                    .then(({ db, client }) =>
                        this.downgradeDatabase.down(
                            db,
                            client,
                        ),
                    )
                    .then((migrated) => {
                        migrated.forEach((migratedItem) => {
                            console.log(
                                `MIGRATED DOWN: ${migratedItem}`,
                            );
                        });
                        process.exit(0);
                    })
                    .catch((err) => {
                        this.handleError(err);
                    });
            });

        program
            .command('status')
            .description(
                'print the changelog of the database',
            )
            .option(
                '-f --file <file>',
                'use a custom config file',
            )
            .action((options: ConfigOption) => {
                global.options = options;
                this.database
                    .connect()
                    .then(({ db, client }) =>
                        this.migrationStatus.status(db),
                    )
                    .then((statusItems) =>
                        this.printStatusTable(statusItems),
                    )
                    .then(() => {
                        process.exit(0);
                    })
                    .catch((err) => {
                        this.handleError(err);
                    });
            });

        program.parse(process.argv);

        if (_.isEmpty(program.args)) {
            program.outputHelp();
        }
    }
}

(async () => {
    const main = new Main();
    await main.init();
})();
