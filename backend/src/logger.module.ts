import { Module, Global } from '@nestjs/common';
import { AppLogger } from 'src/common/logger/logger.service';
@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
