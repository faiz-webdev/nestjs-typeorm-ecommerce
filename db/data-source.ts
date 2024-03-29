import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'mariadb',
  replication: {
    master: {
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    slaves: [
      {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      },
    ],
  },
  entities: ['dist/**/*.entity.{ts,js}'],
  migrations: ['dist/db/migrations/*.{ts,js}'],
  logging: false,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
dataSource
  .initialize()
  .then((res) => {})
  .catch((err) => console.log('err: ', err));
export default dataSource;
