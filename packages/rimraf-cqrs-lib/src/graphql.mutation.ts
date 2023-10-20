
export const getMutation = <T extends object>() => {
    const mutation = new Proxy<T>({} as T, {
        get: (target, prop, rec) => prop == "__isTypeOf" ? undefined : () => () => { }
    });
}

