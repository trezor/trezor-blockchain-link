import { HANDSHAKE } from '../constants/messages';
import * as RESPONSES from '../constants/responses';

export interface Connect {
    type: typeof RESPONSES.CONNECT,
    payload: boolean,
}

export interface Error {
    type: typeof RESPONSES.ERROR,
    payload: string,
}

export interface GetInfo {
    type: typeof RESPONSES.GET_INFO,
    payload: {
        name: string,
        shortcut: string,
        decimals: number,
        block: number,
        fee: string,
        reserved?: string,
    },
}

export interface GetAccountInfo {
    type: typeof RESPONSES.GET_ACCOUNT_INFO;
    payload: any,
};

export interface EstimateFee {
    type: typeof RESPONSES.ESTIMATE_FEE,
    payload: [{ name: string, value: string }],
};

export interface Subscribe {
    type: typeof RESPONSES.SUBSCRIBE,
    payload: boolean,
};

export interface BlockEvent {
    type: 'block',
    payload: {
        block: string,
        hash: string,
    },
};

interface Input {
    addresses: string[],
}

interface Output {
    addresses: string[],
}

interface Token {
    name: string,
    shortcut: string,
    value: string,
}

export interface Transaction {
    type: ['send' | 'recv'],
    timestamp: number,
    blockHeight: number,
    blockHash: string,
    descriptor: string,
    inputs: Input[],
    outputs: Output[],
    
    hash: string,
    amount: string,
    fee: string,
    total: string,

    tokens?: Token[],
    sequence?: number, // eth: nonce || ripple: sequence
}

export interface NotificationEvent {
    type: 'notification',
    payload: Transaction,
}; 

export interface Notification {
    type: typeof RESPONSES.NOTIFICATION,
    payload: BlockEvent | NotificationEvent,
};

export interface Unsubscribe {
    type: typeof RESPONSES.UNSUBSCRIBE,
    payload: boolean,
}

export interface PushTransaction {
    type: typeof RESPONSES.PUSH_TRANSACTION;
    payload: any;
}

interface WithoutPayload  {
    id: number,
    type: typeof HANDSHAKE | typeof RESPONSES.CONNECTED,
}

// extended
export interface Response {
    test: string
    // WithoutPayload | { id: number, type: typeof RESPONSES.DISCONNECTED, payload: boolean } |
    // { id: number } & Error |
    // { id: number } & Connect |
    // { id: number } & GetInfo |
    // { id: number } & GetAccountInfo |
    // { id: number } & EstimateFee |
    // { id: number } & Subscribe |
    // { id: number } & Unsubscribe |
    // { id: number } & Notification |
    // { id: number } & PushTransaction
}
