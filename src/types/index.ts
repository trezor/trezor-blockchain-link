export interface Deferred<T> {
    id: number,
    promise: Promise<T>,
    resolve: (t: T) => void,
    reject: (e: Error) => void,
}; 
export interface BlockchainSettings {
    name: string,
    worker: string | Function,
    server: string[],
    debug?: boolean,
};

export interface BlockchainInfo {
    name: string,
    id: string,
    currentBlock: number,
};

export interface AccountInfo {
    addresses: string[],
    balance: string,
    availableBalance: string,
};
