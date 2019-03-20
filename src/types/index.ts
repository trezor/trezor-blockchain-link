export type Deferred<T> = {
    id: number,
    promise: Promise<T>,
    resolve: (t: T) => void,
    reject: (e: Error) => void,
}; 

export interface BlockchainSettings {
    name: string,
    worker: string | Function,
    server: Array<string>,
    debug?: boolean,
};

export interface BlockchainInfo {
    name: string,
    id: string,
    currentBlock: number,
};

export interface AccountInfo {
    addresses: Array<string>,
    balance: string,
    availableBalance: string,
};
