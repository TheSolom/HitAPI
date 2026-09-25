import { BaseRequestLogsOptionsDto } from './base-request-logs-options.dto.js';
import type { GetRequestLogTimelineOptions } from '@hitapi/types';

export class GetRequestLogTimelineOptionsDto
    extends BaseRequestLogsOptionsDto
    implements GetRequestLogTimelineOptions {}
