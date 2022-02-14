import fs from 'fs/promises';
import { join } from 'path';

import { MigrationDirectory } from '../utils/migration-directory.util';
import { ConfigMigrateMongodbUtil } from '../utils/config.util';

export class InitializeMigration {
    constructor(
        private migrationDirectory: MigrationDirectory,
        private configMigrateMongodbUtil: ConfigMigrateMongodbUtil,
    ) {}

    copySampleConfigFile() {
        const source = join(
            __dirname,
            `../../samples/${ConfigMigrateMongodbUtil.DEFAULT_CONFIG_FILE_NAME}`,
        );
        const destination = join(
            process.cwd(),
            ConfigMigrateMongodbUtil.DEFAULT_CONFIG_FILE_NAME,
        );
        return fs.copyFile(source, destination);
    }

    createMigrationsDirectory() {
        return fs.mkdir(join(process.cwd(), 'migrations'));
    }

    async init(): Promise<void> | never {
        await this.migrationDirectory.shouldNotExist();
        await this.configMigrateMongodbUtil.shouldNotExist();
        await this.copySampleConfigFile();
        return this.createMigrationsDirectory();
    }
}
