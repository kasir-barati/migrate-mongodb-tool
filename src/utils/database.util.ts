import { MongoClient, MongoClientOptions } from 'mongodb';
import _ from 'lodash';

import { ConfigMigrateMongodbUtil } from './config.util';

export class Database {
    constructor(
        private readonly configMigrateMongodbUtil: ConfigMigrateMongodbUtil,
    ) {}

    async connect() {
        const configContent =
            this.configMigrateMongodbUtil
                .customConfigContent;
        const url = _.get(configContent, 'mongodb.url');
        const databaseName = _.get(
            configContent,
            'mongodb.databaseName',
        );
        const options = <MongoClientOptions>(
            _.get(configContent, 'mongodb.options')
        );

        if (!url) {
            throw new Error(
                'No `url` defined in config file!',
            );
        }

        const client: MongoClient =
            await MongoClient.connect(url, options);

        const db = client.db(databaseName);
        (db as any).close = client.close;

        return {
            client,
            db,
        };
    }
}
