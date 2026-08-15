import { FindOptionsWhere } from 'typeorm';
import type { OrderDirection } from '@hitapi/types';

export type FindOptions<T = unknown> = {
    where?: FindOptionsWhere<T>[] | FindOptionsWhere<T>;
    select?: string[];
    relations?: string[];
    order?: OrderDirection;
    skip?: number;
    take?: number;
};
