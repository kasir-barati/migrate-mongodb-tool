import { Db, MongoClient } from 'mongodb';
import _ from 'lodash';
import { promisify } from 'util';
import fnArgs from 'fn-args';

import { MigrationStatus } from './status';
import { ConfigMigrateMongodbUtil } from '../utils/config.util';
import { MigrationDirectory } from '../utils/migration-directory.util';
import { hasCallback } from '../utils/has-callback.util';

export class DowngradeDatabase {
    constructor(
        private migrationStatus: MigrationStatus,
        private migrationDirectory: MigrationDirectory,
        private configMigrateMongodbUtil: ConfigMigrateMongodbUtil,
    ) {}

    async down(db: Db, client: MongoClient) {
        const downgraded = [];
        const statusItems =
            await this.migrationStatus.status(db);
        const appliedItems = statusItems.filter(
            (item) => item.appliedAt !== 'PENDING',
        );
        const lastAppliedItem = _.last(appliedItems);

        if (lastAppliedItem) {
            try {
                const migration =
                    await this.migrationDirectory.loadMigration(
                        lastAppliedItem.fileName,
                    );
                const down = hasCallback(migration.down)
                    ? promisify(migration.down)
                    : migration.down;

                if (
                    hasCallback(migration.down) &&
                    fnArgs(migration.down).length < 3
                ) {
                    // support old callback-based migrations prior to migrate-mongo 7.x.x
                    await down(db);
                } else {
                    await down(db, client);
                }
            } catch (err: any) {
                throw new Error(
                    `Could not migrate down ${lastAppliedItem.fileName}: ${err.message}`,
                );
            }

            const { changelogCollectionName } =
                await this.configMigrateMongodbUtil.read();
            const changelogCollection = db.collection(
                changelogCollectionName,
            );

            try {
                await changelogCollection.deleteOne({
                    fileName: lastAppliedItem.fileName,
                });
                downgraded.push(lastAppliedItem.fileName);
            } catch (err: any) {
                throw new Error(
                    `Could not update changelog: ${err.message}`,
                );
            }
        }

        return downgraded;
    }
}
