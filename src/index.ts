import EventEmitter from 'events';

import { MESSAGES, RESPONSES } from './constants';
import { create as createDeferred } from './utils/deferred';

const workerWrapper = (factory) => {
    if (typeof factory === 'function') return new factory();
    if (typeof factory === 'string' && typeof Worker !== 'undefined') return new Worker(factory);
    // use custom worker
    throw new Error('Cannot use worker');
};

// initialize worker communication, raise error if worker not found
const initWorker = async (settings) => {
    const dfd = createDeferred(-1);
    const worker = workerWrapper(settings.worker);
    worker.onmessage = (message: any) => {
        if (message.data.type !== MESSAGES.HANDSHAKE) return;
        delete settings.worker;
        worker.postMessage({
            type: MESSAGES.HANDSHAKE,
            settings,
        });
        dfd.resolve(worker);
    };

    worker.onerror = (error) => {
        worker.onmessage = null;
        worker.onerror = null;
        const msg = error.message
            ? `Worker runtime error: Line ${error.lineno} in ${error.filename}: ${error.message}`
            : 'Worker handshake error';
        dfd.reject(new Error(msg));
    };

    return dfd.promise;
};

class BlockchainLink extends EventEmitter {
    settings;

    messageId;

    worker: Worker;

    deferred = [];

    constructor(settings) {
        super();
        this.settings = settings;
    }

    async getWorker() {
        if (!this.worker) {
            this.worker = await initWorker(this.settings);
            // $FlowIssue MessageEvent type
            this.worker.onmessage = this.onMessage.bind(this);
            // $FlowIssue ErrorEvent type
            this.worker.onerror = this.onError.bind(this);
        }
        return this.worker;
    }

    // Sending messages to worker
    __send: <R>(message) => Promise<R> = async message => {
        await this.getWorker();
        const dfd = createDeferred(this.messageId);
        this.deferred.push(dfd);
        this.worker.postMessage({ id: this.messageId, ...message });
        this.messageId++;
        return dfd.promise;
    };

    async connect() {
        return await this.__send({
            type: MESSAGES.CONNECT,
        });
    }

    async getInfo() {
        return await this.__send({
            type: MESSAGES.GET_INFO,
        });
    }

    async getAccountInfo(payload) {
        return await this.__send({
            type: MESSAGES.GET_ACCOUNT_INFO,
            payload,
        });
    }

    async estimateFee(payload) {
        return await this.__send({
            type: MESSAGES.ESTIMATE_FEE,
            payload,
        });
    }

    async subscribe(payload) {
        return await this.__send({
            type: MESSAGES.SUBSCRIBE,
            payload,
        });
    }

    async unsubscribe(payload) {
        return await this.__send({
            type: MESSAGES.UNSUBSCRIBE,
            payload,
        });
    }

    async pushTransaction(payload) {
        return await this.__send({
            type: MESSAGES.PUSH_TRANSACTION,
            payload,
        });
    }

    async disconnect() {
        if (!this.worker) return true;
        return await this.__send({
            type: MESSAGES.DISCONNECT,
        });
    }

    // worker messages handler

    onMessage: (event) => void = event => {
        if (!event.data) return;
        const { data } = event;

        if (data.id === -1) {
            this.onEvent(event);
            return;
        }

        const dfd = this.deferred.find(d => d.id === data.id);
        if (!dfd) {
            console.warn(`Message with id ${data.id} not found`);
            return;
        }
        if (data.type === RESPONSES.ERROR) {
            dfd.reject(new Error(data.payload));
        } else {
            dfd.resolve(data.payload);
        }
        this.deferred = this.deferred.filter(d => d !== dfd);
    };

    onEvent: (event) => void = event => {
        if (!event.data) return;
        const { data } = event;

        if (data.type === RESPONSES.CONNECTED) {
            this.emit('connected');
        } else if (data.type === RESPONSES.DISCONNECTED) {
            this.emit('disconnected');
        } else if (data.type === RESPONSES.ERROR) {
            this.emit('error', data.payload);
        } else if (data.type === RESPONSES.NOTIFICATION) {
            this.emit(data.payload.type, data.payload.payload);
        }
    };

    onNotification: (notification) => void = notification => {
        this.emit(notification.type, notification.payload);
    };

    onError: (error: { message, lineno, filename }) => void = error => {
        const message = error.message
            ? `Worker runtime error: Line ${error.lineno} in ${error.filename}: ${error.message}`
            : 'Worker handshake error';
        const e = new Error(message);
        // reject all pending responses
        this.deferred.forEach(d => {
            d.reject(e);
        });
        this.deferred = [];
    };

    dispose() {
        if (this.worker) {
            this.worker.terminate();
            delete this.worker;
        }
    }
}

export default BlockchainLink;
