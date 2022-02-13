import { Db, MongoClient } from 'mongodb';
import _ from 'lodash';
import pEachSeries from 'p-each-series';
import { promisify } from 'util';
import fnArgs from 'fn-args';

import { MigrationStatus } from './status';
import { ConfigMigrateMongodbUtil } from '../utils/config.util';
import { MigrationDirectory } from '../utils/migration-directory.util';
import { hasCallback } from '../utils/has-callback.util';
import { Item } from 'src/types/item.type';

export class UpgradeDatabase {
    constructor(
        private migrationStatus: MigrationStatus,
        private configMigrateMongodbUtil: ConfigMigrateMongodbUtil,
        private migrationDirectory: MigrationDirectory,
    ) {}

    async up(db: Db, client: MongoClient) {
        const statusItems =
            await this.migrationStatus.status(db);
        const pendingItems = _.filter(statusItems, {
            appliedAt: 'PENDING',
        });
        const migrated: any[] = [];

        const migrateItem = async (item: Item) => {
            try {
                const migration =
                    await this.migrationDirectory.loadMigration(
                        item.fileName,
                    );
                const up = hasCallback(migration.up)
                    ? promisify(migration.up)
                    : migration.up;

                if (
                    hasCallback(migration.up) &&
                    fnArgs(migration.up).length < 3
                ) {
                    // support old callback-based migrations prior to migrate-mongo 7.x.x
                    await up(db);
                } else {
                    await up(db, client);
                }
            } catch (err: any) {
                const error = new Error(
                    `Could not migrate up ${item.fileName}: ${err.message}`,
                );
                error.stack = err.stack;
                error.migrated = migrated;
                throw error;
            }

            const { changelogCollectionName, useFileHash } =
                await this.configMigrateMongodbUtil.read();
            const changelogCollection = db.collection(
                changelogCollectionName,
            );

            const { fileName, fileHash } = item;
            const appliedAt = new Date();

            try {
                await changelogCollection.insertOne(
                    useFileHash === true
                        ? { fileName, fileHash, appliedAt }
                        : { fileName, appliedAt },
                );
            } catch (err: any) {
                throw new Error(
                    `Could not update changelog: ${err.message}`,
                );
            }
            migrated.push(item.fileName);
        };

        await pEachSeries(pendingItems, migrateItem);
        return migrated;
    }
}
