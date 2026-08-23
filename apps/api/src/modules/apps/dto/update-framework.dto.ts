import { PartialType } from '@nestjs/swagger';
import type { UpdateFrameworkPayload } from '@hitapi/types';
import { CreateFrameworkDto } from './create-framework.dto.js';

export class UpdateFrameworkDto
    extends PartialType(CreateFrameworkDto)
    implements UpdateFrameworkPayload {}
