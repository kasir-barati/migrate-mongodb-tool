import { Db } from 'mongodb';
import { find } from 'lodash';

import { MigrationDirectory } from '../utils/migration-directory.util';
import { ConfigMigrateMongodbUtil } from '../utils/config.util';

export class MigrationStatus {
    constructor(
        private migrationDirectory: MigrationDirectory,
        private configMigrateMongodbUtil: ConfigMigrateMongodbUtil,
    ) {}

    async status(db: Db) {
        await this.migrationDirectory.shouldExist();
        await this.configMigrateMongodbUtil.shouldExist();

        const fileNames =
            await this.migrationDirectory.getFileNames();
        const { changelogCollectionName, useFileHash } =
            await this.configMigrateMongodbUtil.read();
        const changelogCollection = db.collection(
            changelogCollectionName,
        );
        const changelog = await changelogCollection
            .find({})
            .toArray();

        const useFileHashTest = useFileHash === true;
        const statusTable = await Promise.all(
            fileNames.map(async (fileName) => {
                let fileHash!: string;
                let findTest: {
                    fileName: string;
                    fileHash?: string;
                } = { fileName };
                if (useFileHashTest) {
                    fileHash =
                        await this.migrationDirectory.loadFileHash(
                            fileName,
                        );
                    findTest = { fileName, fileHash };
                }
                const itemInLog = find(changelog, findTest);
                const appliedAt: string = itemInLog
                    ? itemInLog.appliedAt.toJSON()
                    : 'PENDING';
                return useFileHash
                    ? { fileName, fileHash, appliedAt }
                    : { fileName, appliedAt };
            }),
        );

        return statusTable;
    }
}
