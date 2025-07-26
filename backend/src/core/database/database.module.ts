import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const start = Date.now();
        const uri = configService.get<string>('MONGO_URI');
        console.log(
          `Loading MongoDB configuration took ${Date.now() - start}ms`,
        );

        if (!uri) {
          throw new Error('MONGO_URI is not defined in the configuration');
        }

        console.log(`Connecting to MongoDB at ${uri}`);
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
