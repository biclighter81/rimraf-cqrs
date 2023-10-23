
export const getMutation = <T extends object>() => {
    return new Proxy<T>({} as T, {
        get: (target, prop, rec) => prop == "__isTypeOf" ? undefined : () => () => { }
    });
}

