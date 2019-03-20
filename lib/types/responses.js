// /* @flow */
// import { HANDSHAKE } from '../constants/messages';
// import * as RESPONSES from '../constants/responses';
// // messages sent from worker to blockchain.js
// export type Connect = {
//     +type: typeof RESPONSES.CONNECT,
//     +payload: boolean,
// }
// export type Error = {
//     +type: typeof RESPONSES.ERROR,
//     +payload: string,
// }
// export type GetInfo = {
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
// export type GetAccountInfo = {
//     +type: typeof RESPONSES.GET_ACCOUNT_INFO;
//     // +payload: RIPPLE.GetAccountInfo$;
//     +payload: any,
// };
// export type EstimateFee = {
//     +type: typeof RESPONSES.ESTIMATE_FEE,
//     +payload: Array<{ name: string, value: string }>,
// };
// export type Subscribe = {
//     +type: typeof RESPONSES.SUBSCRIBE,
//     +payload: boolean,
// };
// export type BlockEvent = {
//     +type: 'block',
//     +payload: {
//         block: string,
//         hash: string,
//     },
// };
// type Input = {
//     addresses: Array<string>,
// }
// type Output = {
//     addresses: Array<string>,
// }
// type Token = {
//     name: string,
//     shortcut: string,
//     value: string,
// }
// export type Transaction = {
//     type: 'send' | 'recv',
//     timestamp: ?number,
//     blockHeight: ?number,
//     blockHash: ?string,
//     descriptor: string,
//     inputs: Array<Input>,
//     outputs: Array<Output>,
//     hash: string,
//     amount: string,
//     fee: string,
//     total: string,
//     tokens?: Array<Token>,
//     sequence?: number, // eth: nonce || ripple: sequence
// }
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
// export type PushTransaction = {
//     +type: typeof RESPONSES.PUSH_TRANSACTION;
//     // +payload: RIPPLE.PushTransaction$ | BLOCKBOOK.PushTransaction$;
//     +payload: any;
// }
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
"use strict";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy9yZXNwb25zZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gLyogQGZsb3cgKi9cblxuLy8gaW1wb3J0IHsgSEFORFNIQUtFIH0gZnJvbSAnLi4vY29uc3RhbnRzL21lc3NhZ2VzJztcbi8vIGltcG9ydCAqIGFzIFJFU1BPTlNFUyBmcm9tICcuLi9jb25zdGFudHMvcmVzcG9uc2VzJztcblxuLy8gLy8gbWVzc2FnZXMgc2VudCBmcm9tIHdvcmtlciB0byBibG9ja2NoYWluLmpzXG5cbi8vIGV4cG9ydCB0eXBlIENvbm5lY3QgPSB7XG4vLyAgICAgK3R5cGU6IHR5cGVvZiBSRVNQT05TRVMuQ09OTkVDVCxcbi8vICAgICArcGF5bG9hZDogYm9vbGVhbixcbi8vIH1cblxuLy8gZXhwb3J0IHR5cGUgRXJyb3IgPSB7XG4vLyAgICAgK3R5cGU6IHR5cGVvZiBSRVNQT05TRVMuRVJST1IsXG4vLyAgICAgK3BheWxvYWQ6IHN0cmluZyxcbi8vIH1cblxuLy8gZXhwb3J0IHR5cGUgR2V0SW5mbyA9IHtcbi8vICAgICArdHlwZTogdHlwZW9mIFJFU1BPTlNFUy5HRVRfSU5GTyxcbi8vICAgICAvLyArcGF5bG9hZDogUklQUExFLkdldEluZm8kIHwgQkxPQ0tCT09LLkdldEluZm8kLFxuLy8gICAgICtwYXlsb2FkOiB7XG4vLyAgICAgICAgICtuYW1lOiBzdHJpbmcsXG4vLyAgICAgICAgICtzaG9ydGN1dDogc3RyaW5nLFxuLy8gICAgICAgICArZGVjaW1hbHM6IG51bWJlcixcbi8vICAgICAgICAgK2Jsb2NrOiBudW1iZXIsXG4vLyAgICAgICAgICtmZWU6IHN0cmluZyxcbi8vICAgICAgICAgK3Jlc2VydmVkPzogc3RyaW5nLFxuLy8gICAgIH0sXG4vLyB9XG5cbi8vIGV4cG9ydCB0eXBlIEdldEFjY291bnRJbmZvID0ge1xuLy8gICAgICt0eXBlOiB0eXBlb2YgUkVTUE9OU0VTLkdFVF9BQ0NPVU5UX0lORk87XG4vLyAgICAgLy8gK3BheWxvYWQ6IFJJUFBMRS5HZXRBY2NvdW50SW5mbyQ7XG4vLyAgICAgK3BheWxvYWQ6IGFueSxcbi8vIH07XG5cbi8vIGV4cG9ydCB0eXBlIEVzdGltYXRlRmVlID0ge1xuLy8gICAgICt0eXBlOiB0eXBlb2YgUkVTUE9OU0VTLkVTVElNQVRFX0ZFRSxcbi8vICAgICArcGF5bG9hZDogQXJyYXk8eyBuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfT4sXG4vLyB9O1xuXG4vLyBleHBvcnQgdHlwZSBTdWJzY3JpYmUgPSB7XG4vLyAgICAgK3R5cGU6IHR5cGVvZiBSRVNQT05TRVMuU1VCU0NSSUJFLFxuLy8gICAgICtwYXlsb2FkOiBib29sZWFuLFxuLy8gfTtcblxuLy8gZXhwb3J0IHR5cGUgQmxvY2tFdmVudCA9IHtcbi8vICAgICArdHlwZTogJ2Jsb2NrJyxcbi8vICAgICArcGF5bG9hZDoge1xuLy8gICAgICAgICBibG9jazogc3RyaW5nLFxuLy8gICAgICAgICBoYXNoOiBzdHJpbmcsXG4vLyAgICAgfSxcbi8vIH07XG5cbi8vIHR5cGUgSW5wdXQgPSB7XG4vLyAgICAgYWRkcmVzc2VzOiBBcnJheTxzdHJpbmc+LFxuLy8gfVxuXG4vLyB0eXBlIE91dHB1dCA9IHtcbi8vICAgICBhZGRyZXNzZXM6IEFycmF5PHN0cmluZz4sXG4vLyB9XG5cbi8vIHR5cGUgVG9rZW4gPSB7XG4vLyAgICAgbmFtZTogc3RyaW5nLFxuLy8gICAgIHNob3J0Y3V0OiBzdHJpbmcsXG4vLyAgICAgdmFsdWU6IHN0cmluZyxcbi8vIH1cblxuLy8gZXhwb3J0IHR5cGUgVHJhbnNhY3Rpb24gPSB7XG4vLyAgICAgdHlwZTogJ3NlbmQnIHwgJ3JlY3YnLFxuLy8gICAgIHRpbWVzdGFtcDogP251bWJlcixcbi8vICAgICBibG9ja0hlaWdodDogP251bWJlcixcbi8vICAgICBibG9ja0hhc2g6ID9zdHJpbmcsXG4vLyAgICAgZGVzY3JpcHRvcjogc3RyaW5nLFxuLy8gICAgIGlucHV0czogQXJyYXk8SW5wdXQ+LFxuLy8gICAgIG91dHB1dHM6IEFycmF5PE91dHB1dD4sXG4gICAgXG4vLyAgICAgaGFzaDogc3RyaW5nLFxuLy8gICAgIGFtb3VudDogc3RyaW5nLFxuLy8gICAgIGZlZTogc3RyaW5nLFxuLy8gICAgIHRvdGFsOiBzdHJpbmcsXG5cbi8vICAgICB0b2tlbnM/OiBBcnJheTxUb2tlbj4sXG4vLyAgICAgc2VxdWVuY2U/OiBudW1iZXIsIC8vIGV0aDogbm9uY2UgfHwgcmlwcGxlOiBzZXF1ZW5jZVxuLy8gfVxuXG4vLyBleHBvcnQgdHlwZSBOb3RpZmljYXRpb25FdmVudCA9IHtcbi8vICAgICArdHlwZTogJ25vdGlmaWNhdGlvbicsXG4vLyAgICAgK3BheWxvYWQ6IFRyYW5zYWN0aW9uLFxuLy8gfTtcblxuLy8gZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uID0ge1xuLy8gICAgICt0eXBlOiB0eXBlb2YgUkVTUE9OU0VTLk5PVElGSUNBVElPTixcbi8vICAgICArcGF5bG9hZDogQmxvY2tFdmVudCB8IE5vdGlmaWNhdGlvbkV2ZW50LFxuLy8gfTtcblxuLy8gZXhwb3J0IHR5cGUgVW5zdWJzY3JpYmUgPSB7XG4vLyAgICAgK3R5cGU6IHR5cGVvZiBSRVNQT05TRVMuVU5TVUJTQ1JJQkUsXG4vLyAgICAgK3BheWxvYWQ6IGJvb2xlYW4sXG4vLyB9XG5cbi8vIGV4cG9ydCB0eXBlIFB1c2hUcmFuc2FjdGlvbiA9IHtcbi8vICAgICArdHlwZTogdHlwZW9mIFJFU1BPTlNFUy5QVVNIX1RSQU5TQUNUSU9OO1xuLy8gICAgIC8vICtwYXlsb2FkOiBSSVBQTEUuUHVzaFRyYW5zYWN0aW9uJCB8IEJMT0NLQk9PSy5QdXNoVHJhbnNhY3Rpb24kO1xuLy8gICAgICtwYXlsb2FkOiBhbnk7XG4vLyB9XG5cbi8vIHR5cGUgV2l0aG91dFBheWxvYWQgPSB7XG4vLyAgICAgaWQ6IG51bWJlcixcbi8vICAgICArdHlwZTogdHlwZW9mIEhBTkRTSEFLRSB8IHR5cGVvZiBSRVNQT05TRVMuQ09OTkVDVEVELFxuLy8gICAgICtwYXlsb2FkPzogYW55LCAvLyBqdXN0IGZvciBmbG93XG4vLyB9XG5cbi8vIC8vIGV4dGVuZGVkXG4vLyBleHBvcnQgdHlwZSBSZXNwb25zZSA9IFxuLy8gICAgIFdpdGhvdXRQYXlsb2FkIHxcbi8vICAgICB7IGlkOiBudW1iZXIsICt0eXBlOiB0eXBlb2YgUkVTUE9OU0VTLkRJU0NPTk5FQ1RFRCwgK3BheWxvYWQ6IGJvb2xlYW4gfSB8XG4vLyAgICAgeyBpZDogbnVtYmVyIH0gJiBFcnJvciB8XG4vLyAgICAgeyBpZDogbnVtYmVyIH0gJiBDb25uZWN0IHxcbi8vICAgICB7IGlkOiBudW1iZXIgfSAmIEdldEluZm8gfFxuLy8gICAgIHsgaWQ6IG51bWJlciB9ICYgR2V0QWNjb3VudEluZm8gfFxuLy8gICAgIHsgaWQ6IG51bWJlciB9ICYgRXN0aW1hdGVGZWUgfFxuLy8gICAgIHsgaWQ6IG51bWJlciB9ICYgU3Vic2NyaWJlIHxcbi8vICAgICB7IGlkOiBudW1iZXIgfSAmIFVuc3Vic2NyaWJlIHxcbi8vICAgICB7IGlkOiBudW1iZXIgfSAmIE5vdGlmaWNhdGlvbiB8XG4vLyAgICAgeyBpZDogbnVtYmVyIH0gJiBQdXNoVHJhbnNhY3Rpb247XG4iXX0=