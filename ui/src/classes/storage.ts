export class Storage {
    static setItem(key: StorageKey, data: any) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static getItem(key: StorageKey) {
        const checkItem = localStorage.getItem(key)
        if (checkItem) {
            return JSON.parse(localStorage.getItem(key) || "{}");
        }
        return undefined
    }

    static removeItem(key: StorageKey) {
        localStorage.removeItem(key);
    }
}

export enum StorageKey {
    EMPTY = "EMPTY",
}
