import {
    MigrationDirectory,
    ConfigMigrateMongodbUtil,
} from '../../src/utils';
import {
    CreateMigration,
    InitializeMigration,
} from '../../src/actions';

describe('create', () => {
    let createMigration: CreateMigration;
    let mockedMigrationDirectory: {
        shouldExist: jest.Mock<any, any>;
        resolveMigrationFileExtension: jest.Mock<any, any>;
        doesSampleMigrationExist: jest.Mock<any, any>;
    };
    let mockedConfigMigrateMongodbUtil: {
        shouldExist: jest.Mock<any, any>;
    };

    function mockMigrationDirectory() {
        return {
            shouldExist: jest.fn(),
            resolveMigrationFileExtension: jest.fn(),
            doesSampleMigrationExist: jest
                .fn()
                .mockReturnValue(Promise.resolve(false)),
        };
    }
    function mockConfigMigrateMongodbUtil() {
        return {
            shouldExist: jest
                .fn()
                .mockReturnValue(Promise.resolve()),
        };
    }

    beforeEach(() => {
        mockedMigrationDirectory = mockMigrationDirectory();
        mockedConfigMigrateMongodbUtil =
            mockConfigMigrateMongodbUtil();
        createMigration = new CreateMigration(
            mockedMigrationDirectory as any,
        );
    });

    it('should yield an error when called without a migrationName', async () => {
        expect(
            await createMigration.create(undefined as any),
        ).toThrowError();
    });

    it('should check that the migrations directory exists', async () => {
        const configMigrateMongodbUtil =
            new ConfigMigrateMongodbUtil();
        const migrationDirectory = new MigrationDirectory(
            configMigrateMongodbUtil,
        );
        const initializeMigration = new InitializeMigration(
            migrationDirectory,
            configMigrateMongodbUtil,
        );

        await initializeMigration.init();
        createMigration = new CreateMigration(
            migrationDirectory,
        );

        expect(
            createMigration.create('my-migration'),
        ).toThrowError();
    });

    // This function does not work
    // it('should yield an error when the migrations directory does not exist', async () => {
    //     mockedMigrationDirectory.shouldExist.mockRejectedValue(
    //         Promise.reject(
    //             new Error(
    //                 'migrations directory does not exist',
    //             ),
    //         ),
    //     );

    //     expect(
    //         await createMigration.create('my_migration'),
    //     ).toThrowError();
    // });

    it('should not be necessary to have an config present', async () => {
        await createMigration.create('my_migration');
    });

    //     it('should create a new migration file and yield the filename', async () => {
    //         const clock = sinon.useFakeTimers(
    //             new Date('2016-06-09T08:07:00.077Z').getTime(),
    //         );
    //         const filename = await create('my_description');
    //         expect(fs.copy.called).to.equal(true);
    //         expect(fs.copy.getCall(0).args[0]).to.equal(
    //             path.join(
    //                 __dirname,
    //                 '../../samples/migration.js',
    //             ),
    //         );
    //         expect(fs.copy.getCall(0).args[1]).to.equal(
    //             path.join(
    //                 process.cwd(),
    //                 'migrations',
    //                 '20160609080700-my_description.js',
    //             ),
    //         );
    //         expect(filename).to.equal(
    //             '20160609080700-my_description.js',
    //         );
    //         clock.restore();
    //     });
    //     it('should create a new migration file and yield the filename with custom extension', async () => {
    //         const clock = sinon.useFakeTimers(
    //             new Date('2016-06-09T08:07:00.077Z').getTime(),
    //         );
    //         migrationsDir.resolveMigrationFileExtension.returns(
    //             '.ts',
    //         );
    //         const filename = await create('my_description');
    //         expect(fs.copy.called).to.equal(true);
    //         expect(fs.copy.getCall(0).args[0]).to.equal(
    //             path.join(
    //                 __dirname,
    //                 '../../samples/migration.js',
    //             ),
    //         );
    //         expect(fs.copy.getCall(0).args[1]).to.equal(
    //             path.join(
    //                 process.cwd(),
    //                 'migrations',
    //                 '20160609080700-my_description.ts',
    //             ),
    //         );
    //         expect(filename).to.equal(
    //             '20160609080700-my_description.ts',
    //         );
    //         clock.restore();
    //     });
    //     it('should replace spaces in the description with underscores', async () => {
    //         const clock = sinon.useFakeTimers(
    //             new Date('2016-06-09T08:07:00.077Z').getTime(),
    //         );
    //         await create('this description contains spaces');
    //         expect(fs.copy.called).to.equal(true);
    //         expect(fs.copy.getCall(0).args[0]).to.equal(
    //             path.join(
    //                 __dirname,
    //                 '../../samples/migration.js',
    //             ),
    //         );
    //         expect(fs.copy.getCall(0).args[1]).to.equal(
    //             path.join(
    //                 process.cwd(),
    //                 'migrations',
    //                 '20160609080700-this_description_contains_spaces.js',
    //             ),
    //         );
    //         clock.restore();
    //     });
    //     it('should yield errors that occurred when copying the file', async () => {
    //         fs.copy.returns(
    //             Promise.reject(new Error('Copy failed')),
    //         );
    //         try {
    //             await create('my_description');
    //             expect.fail('Error was not thrown');
    //         } catch (err) {
    //             expect(err.message).to.equal('Copy failed');
    //         }
    //     });
    //     it('should use the sample migration file if it exists', async () => {
    //         const clock = sinon.useFakeTimers(
    //             new Date('2016-06-09T08:07:00.077Z').getTime(),
    //         );
    //         migrationsDir.doesSampleMigrationExist.returns(
    //             true,
    //         );
    //         const filename = await create('my_description');
    //         expect(
    //             migrationsDir.doesSampleMigrationExist.called,
    //         ).to.equal(true);
    //         expect(fs.copy.called).to.equal(true);
    //         expect(fs.copy.getCall(0).args[0]).to.equal(
    //             path.join(
    //                 process.cwd(),
    //                 'migrations',
    //                 'sample-migration.js',
    //             ),
    //         );
    //         expect(fs.copy.getCall(0).args[1]).to.equal(
    //             path.join(
    //                 process.cwd(),
    //                 'migrations',
    //                 '20160609080700-my_description.js',
    //             ),
    //         );
    //         expect(filename).to.equal(
    //             '20160609080700-my_description.js',
    //         );
    //         clock.restore();
    //     });
});
