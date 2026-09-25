import type { GetTrafficOptions as IGetTrafficOptions } from '@hitapi/types';
import { BaseAnalyticsOptionsDto } from '../../../common/dto/base-analytics-options.dto.js';

export class GetTrafficOptionsDto
    extends BaseAnalyticsOptionsDto
    implements IGetTrafficOptions {}
