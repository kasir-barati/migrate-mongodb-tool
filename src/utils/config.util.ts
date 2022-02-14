import fs from 'fs/promises';
import { join, isAbsolute, basename } from 'path';

import { ConfigOption } from '@src/types/config-options.type';

export class ConfigMigrateMongodbUtil {
    public static readonly DEFAULT_CONFIG_FILE_NAME =
        'config.ts';
    private _customConfigContent: ConfigOption;

    getConfigPath() {
        const fileOptionValue = global?.options?.file;

        if (!fileOptionValue) {
            return join(
                process.cwd(),
                ConfigMigrateMongodbUtil.DEFAULT_CONFIG_FILE_NAME,
            );
        }

        if (isAbsolute(fileOptionValue)) {
            return fileOptionValue;
        }

        return join(process.cwd(), fileOptionValue);
    }

    set customConfigContent(configContent: ConfigOption) {
        this._customConfigContent = configContent;
    }

    get customConfigContent() {
        if (this._customConfigContent) {
            return this._customConfigContent;
        }

        const configPath = this.getConfigPath();

        return require(configPath);
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
                await fs.access(configPath);
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
}
