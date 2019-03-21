import * as MESSAGES from '../constants/messages';

export interface Connect {
    type: typeof MESSAGES.CONNECT,
};

export interface GetInfo {
    type: typeof MESSAGES.GET_INFO,
};

export interface GetAccountInfoOptions {
    type: string,
    page: number,
    from: number,
    to: number,
    contract: string
} 

export interface GetAccountInfo {
    type: typeof MESSAGES.GET_ACCOUNT_INFO,
    payload: {
        descriptor: string,
        options?: GetAccountInfoOptions,
    },
};

export interface EstimateFeeOptions {
    transaction?: any, // custom object, used in ethereum
    levels: [{
        name: string,
        value: string,
    }],
};
export interface EstimateFee {
    type: typeof MESSAGES.ESTIMATE_FEE,
    payload?: EstimateFeeOptions,
};

export interface Subscribe {
    type: typeof MESSAGES.SUBSCRIBE,
    payload: {
        type: 'block',
    } | {
        type: 'notification',
        addresses: string[],
        mempool?: boolean,
    };
}

export interface Unsubscribe {
    type: typeof MESSAGES.UNSUBSCRIBE,
    payload: {
        type: 'block',
    } | {
        type: 'notification',
        addresses: string[],
    };
}

export interface PushTransaction {
    type: typeof MESSAGES.PUSH_TRANSACTION,
    payload: string;
}

export interface Message {
    test: string
    // { id: number, type: typeof MESSAGES.HANDSHAKE, settings: BlockchainSettings } |
    // { id: number } & Connect |
    // { id: number } & GetInfo |
    // { id: number } & GetAccountInfo |
    // { id: number } & EstimateFee |
    // { id: number } & Subscribe |
    // { id: number } & PushTransaction
}