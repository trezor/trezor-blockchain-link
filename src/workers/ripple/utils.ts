/* tslint:disable */
import BigNumber from 'bignumber.js';
import * as ResponseTypes from '../../types/responses';

export const concatTransactions = (txs: ResponseTypes.Transaction[], newTxs: ResponseTypes.Transaction[]): ResponseTypes.Transaction[] => {
    if (newTxs.length < 1) return txs;
    const unique = newTxs.filter(tx => txs.indexOf(tx) < 0);
    return txs.concat(unique);
};

export const transformTransactionHistory = (descriptor: string, raw: any): ResponseTypes.Transaction => {
    const { tx } = raw;
    
    if (tx.TransactionType !== 'Payment') {
        // https://github.com/ripple/ripple-lib/blob/develop/docs/index.md#transaction-types
        console.warn("Transform tx type:", tx.TransactionType, tx)
    }

    const type = tx.Account === descriptor ? 'send' : 'recv';
    const {hash} = tx;
    const amount = tx.Amount;
    const fee = tx.Fee;
    const total = new BigNumber(amount).plus(fee).toString();

    return {
        type,
        timestamp: tx.date,

        descriptor,
        inputs: [{ addresses: [tx.Account] }],
        outputs: [{ addresses: [tx.Destination] }],

        hash,
        amount,
        fee,
        total,

        blockHeight: tx.ledger_index,
        blockHash: tx.ledger_hash,
    };
};

export const transformTransactionEvent = (descriptor: string, event: any): Transaction => {
    const tx = event.transaction;
    const isPayment = tx.TransactionType === 'Payment';
    const type = tx.Account === descriptor ? 'send' : 'recv';
    const {hash} = tx;
    const amount = tx.Amount;
    const fee = tx.Fee;
    const total = isPayment ? new BigNumber(amount).plus(fee).toString() : '0';
    const tokens = !isPayment ? [
        { name: tx.TransactionType, shortcut: '', value: '0' }
    ] : undefined;

    return {
        type,
        timestamp: tx.date,
        descriptor,
        inputs: [{ addresses: [tx.Account] }],
        outputs: [{ addresses: [tx.Destination] }],

        hash,
        amount,
        fee,
        total,
        tokens,

        blockHeight: event.ledger_index,
        blockHash: event.ledger_hash,
    };
};
