import { Module } from '@nestjs/common';
import { bullMQConfiguration } from './bullMQ/configuration.js';
import { bullBoardConfiguration } from './bullBoard/configuration.js';

@Module({ imports: [bullMQConfiguration, bullBoardConfiguration] })
export class QueueModule {}
