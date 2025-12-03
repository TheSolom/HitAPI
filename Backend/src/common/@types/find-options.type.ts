import { FindOptionsWhere } from 'typeorm';

export type FindOptions<T> = {
    where: FindOptionsWhere<T>[] | FindOptionsWhere<T>;
    select?: string[];
    relations?: string[];
    order?: Record<string, 'ASC' | 'DESC'>;
    skip?: number;
    take?: number;
};
