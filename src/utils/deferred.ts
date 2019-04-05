
export function create(id) {
    let localResolve: (t) => void = () => {};
    let localReject: (e) => void = () => {};

    const promise = new Promise(async (resolve, reject) => {
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
