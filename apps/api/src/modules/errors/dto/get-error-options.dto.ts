import type { GetErrorOptions as IGetErrorOptions } from '@hitapi/types';
import { BaseAnalyticsOptionsDto } from '../../../common/dto/base-analytics-options.dto.js';

export class GetErrorOptionsDto
    extends BaseAnalyticsOptionsDto
    implements IGetErrorOptions {}
