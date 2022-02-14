import { Db, MongoClient } from 'mongodb';

export default {
    async up(db: Db, client: MongoClient) {
        // TODO: write your migration here.
        // See https://github.com/kasir-barati/migrate-mongodb-tool/#creating-a-new-migration-script
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    },

    async down(db: Db, client: MongoClient) {
        // TODO: write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
