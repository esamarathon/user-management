import _ from 'lodash';
import { models } from './models';
import migrations from './migrations';
import logger from './logger';

export default async function migrate() {
  const migrationsRun = await models.Migration.find({});

  for (let i = 0; i < migrations.length; ++i) {
    const migration = migrations[i];
    if (_.find(migrationsRun, { id: migration.id })) {
      logger.debug(`Skipping migration ${migration.id}`);
    } else {
      logger.info(`Running migration ${migration.id}`);
      logger.info(migration.description);
      const res = await migration.run(); // eslint-disable-line no-await-in-loop
      const migrationResult = new models.Migration({
        id: migration.id,
        description: migration.description,
        result: res
      });
      logger.info('Migration result:', res);
      await migrationResult.save(); // eslint-disable-line no-await-in-loop
      logger.info(`Migration ${migration.id} done`);
    }
  }
}
