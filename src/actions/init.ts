import fs from 'fs-extra';
import { join } from 'path';

import { MigrationDirectory } from '../utils/migration-directory.util';
import { config } from '../utils/config.util';

export class InitializeMigration {
    constructor(
        private migrationDirectory: MigrationDirectory,
    ) {}

    copySampleConfigFile() {
        const source = join(
            __dirname,
            '../../samples/migrate-mongo-config.js',
        );
        const destination = join(
            process.cwd(),
            config.DEFAULT_CONFIG_FILE_NAME,
        );
        return fs.copy(source, destination);
    }

    createMigrationsDirectory() {
        return fs.mkdirs(join(process.cwd(), 'migrations'));
    }

    async init() {
        await this.migrationDirectory.shouldNotExist();
        await config.shouldNotExist();
        await this.copySampleConfigFile();
        return this.createMigrationsDirectory();
    }
}
