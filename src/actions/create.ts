import fs from 'fs/promises';
import { join } from 'path';

import { nowAsString } from '../utils/date.util';
import { MigrationDirectory } from '../utils/migration-directory.util';

export class CreateMigration {
    constructor(
        private migrationDirectory: MigrationDirectory,
    ) {}

    async create(
        migrationName: string,
    ): Promise<string> | never {
        if (!migrationName) {
            throw new Error(
                'Missing parameter: migrationName',
            );
        }

        await this.migrationDirectory.shouldExist();

        const migrationsDirPath =
            this.migrationDirectory.resolve();
        const migrationExtension =
            this.migrationDirectory.resolveMigrationFileExtension();

        // Check if there is a 'sample-migration.js' file in migrations dir - if there is, use that
        let source: string;

        if (
            await this.migrationDirectory.doesSampleMigrationExist()
        ) {
            source =
                this.migrationDirectory.resolveSampleMigrationPath();
        } else {
            source = join(
                __dirname,
                '../../samples/migration.ts',
            );
        }

        const filename = `${nowAsString()}-${migrationName
            .split(' ')
            .join('_')}${migrationExtension}`;
        const destination = join(
            migrationsDirPath,
            filename,
        );

        await fs.copyFile(source, destination);
        return filename;
    }
}
