import fs from 'fs/promises';
import { join } from 'path';
import { InitializeMigration } from '../../src/actions';

describe('init', () => {
    let initializeMigration: InitializeMigration;
    const mockedMigrationDirectory = {
        shouldNotExist: jest.fn(),
    };
    const mockedConfigMigrateMongodbUtil = {
        shouldNotExist: jest.fn(),
    };

    beforeEach(async () => {
        initializeMigration = new InitializeMigration(
            mockedMigrationDirectory as any,
            mockedConfigMigrateMongodbUtil as any,
        );
        await fs.rmdir(
            join(__dirname, '..', '..', 'migrations'),
        );
        await fs.unlink(
            join(__dirname, '..', '..', 'config.ts'),
        );
    });

    it('should check if the migrations directory already exists', async () => {
        await initializeMigration.init();
        expect(
            mockedMigrationDirectory.shouldNotExist,
        ).toHaveBeenCalled();
    });

    // it('should not continue and yield an error if the migrations directory already exists', async () => {
    //     mockedMigrationDirectory.shouldNotExist.mockRejectedValue(
    //         Promise.reject(new Error()),
    //     );
    //     initializeMigration.copySampleConfigFile =
    //         jest.fn();
    //     initializeMigration.createMigrationsDirectory =
    //         jest.fn();

    //     expect(
    //         await initializeMigration.init(),
    //     ).toThrowError();
    //     expect(
    //         initializeMigration.copySampleConfigFile,
    //     ).toHaveBeenCalledTimes(0);
    //     expect(
    //         initializeMigration.createMigrationsDirectory,
    //     ).toHaveBeenCalledTimes(0);
    // });

    // it('should check if the config file already exists', async () => {
    //     await initializeMigration.init();

    //     expect(
    //         mockedConfigMigrateMongodbUtil.shouldNotExist,
    //     ).toReturnWith(true);
    // });

    // it('should not continue and yield an error if the config file already exists', async () => {
    //     config.shouldNotExist.returns(
    //         Promise.resolve(new Error('Config exists')),
    //     );
    //     try {
    //         await init();
    //     } catch (err) {
    //         expect(err.message).to.equal('Config exists');
    //         expect(fs.copy.called).to.equal(false);
    //         expect(fs.mkdirs.called).to.equal(false);
    //     }
    // });

    // it('should copy the sample config file to the current working directory', async () => {
    //     await init();
    //     expect(fs.copy.called).to.equal(true);
    //     expect(fs.copy.callCount).to.equal(1);

    //     const source = fs.copy.getCall(0).args[0];
    //     expect(source).to.equal(
    //         path.join(
    //             __dirname,
    //             '../../samples/migrate-mongo-config.js',
    //         ),
    //     );

    //     const destination = fs.copy.getCall(0).args[1];
    //     expect(destination).to.equal(
    //         path.join(
    //             process.cwd(),
    //             'migrate-mongo-config.js',
    //         ),
    //     );
    // });

    // it('should yield errors that occurred when copying the sample config', async () => {
    //     fs.copy.returns(
    //         Promise.reject(
    //             new Error('No space left on device'),
    //         ),
    //     );
    //     try {
    //         await init();
    //         expect.fail('Error was not thrown');
    //     } catch (err) {
    //         expect(err.message).to.equal(
    //             'No space left on device',
    //         );
    //     }
    // });

    // it('should create a migrations directory in the current working directory', async () => {
    //     await init();

    //     expect(fs.mkdirs.called).to.equal(true);
    //     expect(fs.mkdirs.callCount).to.equal(1);
    //     expect(fs.mkdirs.getCall(0).args[0]).to.deep.equal(
    //         path.join(process.cwd(), 'migrations'),
    //     );
    // });

    // it('should yield errors that occurred when creating the migrations directory', async () => {
    //     fs.mkdirs.returns(
    //         Promise.reject(new Error('I cannot do that')),
    //     );
    //     try {
    //         await init();
    //     } catch (err) {
    //         expect(err.message).to.equal(
    //             'I cannot do that',
    //         );
    //     }
    // });
});
