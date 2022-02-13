import fs from 'fs/promises';
import { join, isAbsolute, basename } from 'path';
import { get } from 'lodash';

export class ConfigMigrateMongodbUtil {
    public readonly DEFAULT_CONFIG_FILE_NAME = 'config.ts';
    customConfigContent: any | null = null;

    getConfigPath() {
        const fileOptionValue = get(
            (global as any).options,
            'file',
        );
        if (!fileOptionValue) {
            return join(
                process.cwd(),
                this.DEFAULT_CONFIG_FILE_NAME,
            );
        }

        if (isAbsolute(fileOptionValue)) {
            return fileOptionValue;
        }
        return join(process.cwd(), fileOptionValue);
    }

    set(configContent: any) {
        this.customConfigContent = configContent;
    }

    async shouldExist() {
        if (!this.customConfigContent) {
            const configPath = this.getConfigPath();
            try {
                await fs.stat(configPath);
            } catch (err) {
                throw new Error(
                    `config file does not exist: ${configPath}`,
                );
            }
        }
    }

    async shouldNotExist() {
        if (!this.customConfigContent) {
            const configPath = this.getConfigPath();
            const error = new Error(
                `config file already exists: ${configPath}`,
            );
            try {
                await fs.stat(configPath);
                throw error;
            } catch (err: any) {
                if (err.code !== 'ENOENT') {
                    throw error;
                }
            }
        }
    }

    getConfigFilename() {
        return basename(this.getConfigPath());
    }

    async read() {
        if (this.customConfigContent) {
            return this.customConfigContent;
        }
        const configPath = this.getConfigPath();
        return Promise.resolve(require(configPath)); // eslint-disable-line
    }
}
