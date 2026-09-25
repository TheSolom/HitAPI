import type { GetPerformanceOptions as IGetPerformanceOptions } from '@hitapi/types';
import { BaseAnalyticsOptionsDto } from '../../../common/dto/base-analytics-options.dto.js';

export class GetPerformanceOptionsDto
    extends BaseAnalyticsOptionsDto
    implements IGetPerformanceOptions {}
