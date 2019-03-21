/* @flow */

export function create(id: number) {
    let localResolve: () => void = () => {};
    let localReject: () => void = () => {};

    const promise: Promise = new Promise(async (resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
    });

    return {
        id,
        resolve: localResolve,
        reject: localReject,
        promise,
    };
}
