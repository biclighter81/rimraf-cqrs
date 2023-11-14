
export const getMutation = <T extends { [idx: string | symbol]: any }>(directMutations?: T) => {
    return new Proxy<T>({} as T, {
        get: (target, prop, rec) => prop == "__isTypeOf" ? undefined : directMutations && prop in directMutations ? directMutations[prop] : () => () => { }
    });
}

