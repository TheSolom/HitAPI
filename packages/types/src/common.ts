export type NullableType<T> = T | null;

export type MaybeType<T> = T | undefined;

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum Environment {
    Development = 'development',
    Production = 'production',
}
