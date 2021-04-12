export type NullableProp<T> =
    T extends (infer U)[] ? NullableProp<U>[] :
        // eslint-disable-next-line @typescript-eslint/ban-types
        T extends object ? NullableProps<T> :
            T;

export type NullableProps<T> = {
    [P in keyof T]+?: NullableProp<T[P]> | null
};
