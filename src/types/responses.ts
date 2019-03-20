// import { HANDSHAKE } from '../constants/messages';
// import * as RESPONSES from '../constants/responses';

// // messages sent from worker to blockchain.js

export interface Connect {
    +type: typeof RESPONSES.CONNECT,
    +payload: boolean,
}

// export interface Error = {
//     +type: typeof RESPONSES.ERROR,
//     +payload: string,
// }

// export interface GetInfo = {
//     +type: typeof RESPONSES.GET_INFO,
//     // +payload: RIPPLE.GetInfo$ | BLOCKBOOK.GetInfo$,
//     +payload: {
//         +name: string,
//         +shortcut: string,
//         +decimals: number,
//         +block: number,
//         +fee: string,
//         +reserved?: string,
//     },
// }

// export interface GetAccountInfo = {
//     +type: typeof RESPONSES.GET_ACCOUNT_INFO;
//     // +payload: RIPPLE.GetAccountInfo$;
//     +payload: any,
// };

// export interface EstimateFee = {
//     +type: typeof RESPONSES.ESTIMATE_FEE,
//     +payload: Array<{ name: string, value: string }>,
// };

// export interface Subscribe = {
//     +type: typeof RESPONSES.SUBSCRIBE,
//     +payload: boolean,
// };

export interface BlockEvent {
    type: 'block',
    payload: {
        block: string,
        hash: string,
    },
};

interface Input {
    addresses: Array<string>,
}

interface Output {
    addresses: Array<string>,
}

interface Token {
    name: string,
    shortcut: string,
    value: string,
}

export type Transaction = {
    type: ['send' | 'recv'],
    timestamp: ?number,
    blockHeight: ?number,
    blockHash: ?string,
    descriptor: string,
    inputs: Array<Input>,
    outputs: Array<Output>,
    
    hash: string,
    amount: string,
    fee: string,
    total: string,

    tokens?: Array<Token>,
    sequence?: number, // eth: nonce || ripple: sequence
}

// export type NotificationEvent = {
//     +type: 'notification',
//     +payload: Transaction,
// };

// export type Notification = {
//     +type: typeof RESPONSES.NOTIFICATION,
//     +payload: BlockEvent | NotificationEvent,
// };

// export type Unsubscribe = {
//     +type: typeof RESPONSES.UNSUBSCRIBE,
//     +payload: boolean,
// }

export interface PushTransaction {
    +type: typeof RESPONSES.PUSH_TRANSACTION;
    // +payload: RIPPLE.PushTransaction$ | BLOCKBOOK.PushTransaction$;
    +payload: any;
}

// type WithoutPayload = {
//     id: number,
//     +type: typeof HANDSHAKE | typeof RESPONSES.CONNECTED,
//     +payload?: any, // just for flow
// }

// // extended
// export type Response = 
//     WithoutPayload |
//     { id: number, +type: typeof RESPONSES.DISCONNECTED, +payload: boolean } |
//     { id: number } & Error |
//     { id: number } & Connect |
//     { id: number } & GetInfo |
//     { id: number } & GetAccountInfo |
//     { id: number } & EstimateFee |
//     { id: number } & Subscribe |
//     { id: number } & Unsubscribe |
//     { id: number } & Notification |
//     { id: number } & PushTransaction;
