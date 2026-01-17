import { FindOptionsWhere } from 'typeorm';
import type { OrderDirection } from '../enums/order-direction.enum.js';

export type FindOptions<T = unknown> = {
    where?: FindOptionsWhere<T>[] | FindOptionsWhere<T>;
    select?: string[];
    relations?: string[];
    order?: OrderDirection;
    skip?: number;
    take?: number;
};
