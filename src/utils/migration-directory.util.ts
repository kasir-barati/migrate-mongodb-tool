import fs from 'fs/promises';
import crypto from 'crypto';
import { join, isAbsolute, extname, basename } from 'path';

import { config } from './config.util';

export class MigrationDirectory {
    public readonly DEFAULT_MIGRATIONS_DIR_NAME =
        'migrations';
    public readonly DEFAULT_MIGRATION_EXT = '.ts';

    async resolve() {
        let migrationsDir;
        try {
            const configContent = await config.read();
            migrationsDir = configContent.migrationsDir; // eslint-disable-line
            // if config file doesn't have migrationsDir key, assume default 'migrations' dir
            if (!migrationsDir) {
                migrationsDir =
                    this.DEFAULT_MIGRATIONS_DIR_NAME;
            }
        } catch (err) {
            // config file could not be read, assume default 'migrations' dir
            migrationsDir =
                this.DEFAULT_MIGRATIONS_DIR_NAME;
        }

        if (isAbsolute(migrationsDir)) {
            return migrationsDir;
        }
        return join(process.cwd(), migrationsDir);
    }

    async resolveMigrationFileExtension() {
        let migrationFileExtension;
        try {
            const configContent = await config.read();
            migrationFileExtension =
                configContent.migrationFileExtension ||
                this.DEFAULT_MIGRATION_EXT;
        } catch (err) {
            // config file could not be read, assume default extension
            migrationFileExtension =
                this.DEFAULT_MIGRATION_EXT;
        }

        if (
            migrationFileExtension &&
            !migrationFileExtension.startsWith('.')
        ) {
            throw new Error(
                'migrationFileExtension must start with dot',
            );
        }

        return migrationFileExtension;
    }

    async resolveSampleMigrationFileName() {
        const migrationFileExtention =
            await this.resolveMigrationFileExtension();
        return `sample-migration${migrationFileExtention}`;
    }

    async resolveSampleMigrationPath() {
        const migrationsDir = await this.resolve();
        const sampleMigrationSampleFileName =
            await this.resolveSampleMigrationFileName();
        return join(
            migrationsDir,
            sampleMigrationSampleFileName,
        );
    }

    async shouldExist() {
        const migrationsDir = await this.resolve();
        try {
            await fs.stat(migrationsDir);
        } catch (err) {
            throw new Error(
                `migrations directory does not exist: ${migrationsDir}`,
            );
        }
    }

    async shouldNotExist() {
        const migrationsDir = await this.resolve();
        const error = new Error(
            `migrations directory already exists: ${migrationsDir}`,
        );

        try {
            await fs.stat(migrationsDir);
            throw error;
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    async getFileNames() {
        const migrationsDir = await this.resolve();
        const migrationExt =
            await this.resolveMigrationFileExtension();
        const files = await fs.readdir(migrationsDir);
        const sampleMigrationFileName =
            await this.resolveSampleMigrationFileName();
        return files
            .filter(
                (file: string) =>
                    extname(file) === migrationExt &&
                    basename(file) !==
                        sampleMigrationFileName,
            )
            .sort();
    }

    async loadMigration(fileName: string) {
        const migrationsDir = await this.resolve();
        return require(join(migrationsDir, fileName)); // eslint-disable-line
    }

    async loadFileHash(fileName: string) {
        const migrationsDir = await this.resolve();
        const filePath = join(migrationsDir, fileName);
        const hash = crypto.createHash('sha256');
        const input = await fs.readFile(filePath);
        hash.update(input);
        return hash.digest('hex');
    }

    async doesSampleMigrationExist() {
        const samplePath =
            await this.resolveSampleMigrationPath();
        try {
            await fs.stat(samplePath);
            return true;
        } catch (err) {
            return false;
        }
    }
}
