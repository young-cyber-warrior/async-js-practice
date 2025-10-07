// ============ 6

if (!Promise.prototype.finally) {
    Promise.prototype.finally = function (callback) {
        return this.then(
            async (value) => {
                await Promise.resolve(callback());
                return value;
            },
            async (error) => {
                await Promise.resolve(callback());
                throw error;
            }
        );
    };
}

// ============ 7

function createLazyThenable(fn) {
    let executed = false;
    let error = null;
    let result = null;

    return {
        then(resolve, reject) {
            if (!executed) {
                try {
                    result = fn();
                    executed = true;
                } catch (err) {
                    error = err;
                    executed = true;
                }
            }

            if (error === null) {
                resolve(result);
            } else {
                reject(error);
            }
        },
    };
}

// const lazy = createLazyThenable(() => {
//     console.log('Выполняется только при первом .then()');
//     return 'Ленивый результат';
// });

// Promise.resolve(lazy)
//     .then((result) => {
//         console.log(result, 1);
//         return result;
//     })
//     .then((result) => console.log(result, 2));

function createCancellableThenable(promise) {
    let executed = false;
    let error,
        result,
        cancelReject = null;

    return {
        then(resolve, reject) {
            if (!executed) {
                executed = true;
                this.run(resolve, reject);
            } else {
                if (error === null) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        },

        run(resolve, reject) {
            const cancelPromise = new Promise((_, rej) => {
                cancelReject = rej;
            });
            Promise.race([promise, cancelPromise])
                .then((data) => {
                    result = data;
                    resolve(data);
                })
                .catch((err) => {
                    error = err;
                    reject(err);
                });
        },

        cancel() {
            if (result === null && executed && cancelReject) {
                cancelReject(new Error('Cancelled'));
            }
        },
    };
}

// const cancellable = createCancellableThenable(
//     new Promise((resolve) => setTimeout(() => resolve('Данные'), 2000))
// );

// setTimeout(() => cancellable.cancel(), 2500);

// cancellable.then(
//     (result) => console.log('Успех:', result),
//     (error) => console.log('Отменено:', error.message)
// );

function createRetryableThenable(fn, maxRetries) {
    let error = null;

    return {
        then(resolve, reject) {
            let attempts = 0;

            const attempt = () => {
                try {
                    fn()
                        .then((data) => resolve(data))
                        .catch((err) => {
                            this.runRetries(err, ++attempts, attempt, reject);
                        });
                } catch (err) {
                    this.runRetries(err, ++attempts, attempt, reject);
                }
            };

            attempt();
        },

        runRetries(err, attempts, attempt, reject) {
            error = err;
            if (attempts >= maxRetries) {
                reject(error);
            } else {
                attempt();
            }
        },
    };
}

// const unreliableFunction = () => {
//     return new Promise((resolve, reject) => {
//         if (false) {
//             resolve('Успех!');
//         } else {
//             reject(new Error('Временная ошибка'));
//         }
//     });
// };

// const retryable = createRetryableThenable(unreliableFunction, 3);

// retryable.then(
//     (result) => console.log('Получен результат:', result),
//     (error) => console.log('Все попытки неудачны:', error.message)
// );

// ==================== 8

function pipe(...fns) {
    return async function run(arg) {
        if (fns.length === 0) {
            return arg;
        }

        return run(await fns.shift()(arg));
    };
}

// function pipe(...fns) {
//     return async (arg) => {
//         let result = arg;

//         for (const fn of fns) {
//             result = await fn(result);
//         }

//         return result;
//     };
// }
// const example = [
//     async (x) => x * 2,
//     async (x) => x + 1,
//     async (x) => `Результат: ${x}`,
// ];

// const pipeline = pipe(...example);

// const result = await pipeline(5).then((data) => console.log(data));
// console.log(example);

async function map(array, asyncFn, concurrency = Infinity) {
    const results = { successful: [], failed: [] };

    for (let index = 0; index < array.length; index += concurrency) {
        const batch = array.slice(index, index + concurrency);
        const batchResults = await Promise.allSettled(
            batch.map((api) => asyncFn(api))
        );

        batchResults.forEach((result, i) => {
            const userId = batch[i];

            if (result.status === 'fulfilled') {
                results.successful.push(result.value);
            } else {
                results.failed.push({
                    userId,
                    error: result.reason.message,
                });
            }
        });
    }

    return results;
}

// async function map(array, asyncFn, concurrency = Infinity) {
//     const results = [];

//     for (let index = 0; index < array.length; index += concurrency) {
//         const batch = array.slice(index, index + concurrency);
//         const batchResults = await Promise.all(
//             batch.map(item => asyncFn(item))
//         );

//         results.push(...batchResults);
//     }

//     return results;
// }

// const urls = [
//     '/api/1',
//     '/api/2',
//     '/api/3',
//     '/api/4',
//     '/api/5',
//     '/api/6',
//     '/api/7',
//     '/api/8',
// ];
// const results = await map(urls, async (url) => {
//     console.log(`Запрос: ${url}`);
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация запроса
//     return `Данные из ${url}`;
// });

// console.log(results);

async function filter(ids, asyncPredicate) {
    const result = [];

    for (const id of ids) {
        const isCorrectUser = await asyncPredicate(id);

        if (isCorrectUser) {
            result.push(id);
        }
    }

    return result;
}

// const users = [1, 2, 3, 4, 5];

// const activeUsers = await filter(users, async (userId) => {
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     return userId % 2 === 0; // Четные пользователи "активны"
// });

// console.log(activeUsers); // [2, 4]

async function reduce(files, asyncReducer, initialValue) {
    let accumulator = initialValue;

    for (const file of files) {
        accumulator = await asyncReducer(accumulator, file);
    }

    return accumulator;
}

// const files = ['file1.txt', 'file2.txt', 'file3.txt'];

// const totalSize = await reduce(files, async (acc, filename) => {
//     await new Promise(resolve => setTimeout(resolve, 100));
//     const size = filename.length * 10;
//     return acc + size;
// }, 0);

// console.log('Общий размер:', totalSize);

async function waterfall(tasks) {
    let args = null;

    for (const task of tasks) {
        if (args === null) {
            args = await task();
        } else {
            args = await task(args);
        }
    }

    return args;
}

// const result = await waterfall([
//     async () => {
//         console.log('Шаг 1: Получение пользователя');
//         return { id: 1, name: 'John' };
//     },
//     async (user) => {
//         console.log('Шаг 2: Получение постов для', user.name);
//         return { user, posts: ['post1', 'post2'] };
//     },
//     async ({ user, posts }) => {
//         console.log(
//             'Шаг 3: Получение комментариев для',
//             posts.length,
//             'постов'
//         );
//         return { user, posts, comments: ['comment1', 'comment2', 'comment3'] };
//     },
// ]);

// console.log('Финальный результат:', result);

// ==================== 9

// function memoizeAsync(fn, options = {}) {
//     const listArgs = new Map();

//     return async (...args) => {
//         const list = [];

//         for (const arg of args) {
//             if (listArgs.has(arg)) {
//                 list.push(listArgs.get(arg));
//             } else {
//                 const result = await fn(arg);
//                 listArgs.set(arg, result);
//                 list.push(result);
//             }
//         }

//         return list;
//     };
// }

function memoizeAsync(fn, options = {}) {
    const cache = new Map();

    return async function (...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = await fn(...args);
        cache.set(key);
        return result;
    };
}
// const memoized = memoizeAsync(async (userId) => {
//     console.log(`Загружаем пользователя ${userId}`);
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     return { id: userId, name: `User ${userId}` };
// });

// console.log(await memoized(1));
// console.log(await memoized(1));
// console.log(await memoized(2));
// console.log(await memoized(2, 3, 4, 5));

function runOptimizeCache(cache, ttl) {
    return setInterval(() => {
        if (cache.size === 150) {
            cache.clear();
        } else {
            for (const [key, value] of cache.entries()) {
                if (Date.now() - value.timestamp > ttl) {
                    cache.delete(key);
                }
            }
        }
    }, Math.min(ttl, 60000));
}

function memoizeWithTTL(fn, ttl) {
    const cache = new Map();
    const cleanupInterval = runOptimizeCache(cache, ttl);
    return {
        memoized: async function (...args) {
            const key = JSON.stringify(args);

            if (cache.has(key)) {
                const item = cache.get(key);

                if (Date.now() - item.timestamp > ttl) {
                    cache.delete(key);
                } else {
                    return item.value;
                }
            }

            const result = await fn(...args);
            cache.set(key, { value: result, timestamp: Date.now() });
            return result;
        },
        destroy: () => {
            clearInterval(cleanupInterval);
            cache.clear();
        },
    };
}

function memoizeWithInvalidation(fn) {
    const cache = new Map();
    const cleanupInterval = runOptimizeCache(cache, ttl);
    return {
        memoized: async function (...args) {
            const key = JSON.stringify(args);

            if (cache.has(key)) {
                const item = cache.get(key);

                if (Date.now() - item.timestamp > ttl) {
                    cache.delete(key);
                } else {
                    return item.value;
                }
            }

            const result = await fn(...args);
            cache.set(key, { value: result, timestamp: Date.now() });
            return result;
        },
        destroy: () => {
            clearInterval(cleanupInterval);
            cache.clear();
        },
        clear: () => cache.clear(),
        invalidate: (key) => {
            if (cache.has(key)) {
                cache.delete(key);
            } else {
                console.error(`We don have the key ${key}`);
            }
        },
    };
}

// ============== 10

// для независимых задач
class PromisePool {
    promisesList = [];
    concurrency = 3;

    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    add(taskFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                taskFn,
                resolve,
                reject,
            });

            this.tryRunNext();
        });
    }

    async tryRunNext() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }

        this.running++;
        const { taskFn, resolve, reject } = this.queue.shift();

        try {
            const result = await taskFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.tryRunNext();
        }
    }
}

// const pool = new PromisePool(3);

// const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];

// const promises = urls.map((url, index) =>
//     pool.add(
//         () =>
//             new Promise((res, rej) => {
//                 setTimeout(() => {
//                     if (index === 10) {
//                         rej(new Error('hi'));
//                     } else {
//                         res(url);
//                     }
//                 }, 1000 * index);
//             })
//     )
// );

async function promiseAllWithProgress(promises, onProgress) {
    const total = promises.length;
    let completed = 0;

    return await Promise.all(
        promises.map((task) => {
            return new Promise(async (res, rej) => {
                try {
                    const result = await task();
                    onProgress(++completed, total);
                    res(result);
                } catch (error) {
                    rej(error);
                }
            });
        })
    );
}

// async function promiseRaceWithTimeout(promises, timeout) {
//     return Promise.race([
//         ...promises,
//         new Promise((_, rej) =>
//             setTimeout(
//                 () =>
//                     rej(
//                         Error('Все промисы либо упали, либо превысили таймаут')
//                     ),
//                 timeout
//             )
//         ),
//     ]);
// }

// Запуск всех параллельно, ждем первый выполненный если он не привышает timeout, или ошибки
//  все упали промисы или таймаут прривышен

async function promiseRaceWithTimeout(promises, timeout) {
    let timeoutId = null;
    let failedCount = 0;
    let resolved = false;

    return new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                reject(new Error('Все превысили таймаут'));
            }
        }, timeout);

        promises.forEach(async (promiseFn) => {
            try {
                const result = await promiseFn();
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeoutId);
                    resolve(result);
                }
            } catch (error) {
                failedCount++;
                if (failedCount === promises.length && !resolved) {
                    resolved = true;
                    clearTimeout(timeoutId);
                    reject(new Error('Все промисы упали'));
                }
            }
        });
    });
}

// const result = await promiseRaceWithTimeout(
//     [
//         () =>
//             new Promise((resolve, reject) => {
//                 console.log('1');
//                 setTimeout(() => resolve(1), 1000);
//             }),
//         () =>
//             new Promise((resolve, reject) => {
//                 console.log('2');
//                 setTimeout(() => resolve(2), 2000);
//             }),
//         () =>
//             new Promise((resolve, reject) => {
//                 console.log('3');
//                 setTimeout(() => resolve(3), 2000);
//             }),
//         () =>
//             new Promise((resolve, reject) => {
//                 console.log('4');
//                 setTimeout(() => resolve(4), 500);
//             }),
//     ],
//     5000
// )
//     .then((data) => console.log(data))
//     .catch((err) => console.log(err, '1'));

async function promiseChain(tasks) {
    const result = {};
    let args = undefined;

    for (const { task, name } of tasks) {
        try {
            args = await task(args);
            result[name] = args;
        } catch (error) {
            throw new Error(`Task "${name}" failed: ${error.message}`);
        }
    }

    return result;
}

const tasks = [
    {
        name: 'auth',
        task: () => 'auth', // без аргументов
    },
    {
        name: 'user',
        task: (authResult) => `${authResult}/user`, // получает результат auth
    },
    {
        name: 'posts',
        task: (userResult) => `${userResult}/posts`, // получает результат user
    },
];

// ============== 11

function calculateTimerDelay(backoff, initialDelay, maxDelay, currentAttempt) {
    if (backoff === 'fixed') {
        return Math.min(initialDelay, maxDelay);
    }

    if (backoff === 'linear') {
        return Math.min(initialDelay * currentAttempt, maxDelay);
    }

    return Math.min(initialDelay * Math.pow(2, currentAttempt - 1), maxDelay);
}

async function withRetry(fn, options) {
    const {
        maxAttempts,
        backoff,
        initialDelay,
        maxDelay,
        shouldRetry,
        onRetry,
    } = options;

    async function attempt(currentAttempt) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            if (
                shouldRetry({ code: error.message }) &&
                currentAttempt < maxAttempts
            ) {
                onRetry(currentAttempt, { message: error.message });
                const delay = calculateTimerDelay(
                    backoff,
                    initialDelay,
                    maxDelay,
                    currentAttempt
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                return attempt(++currentAttempt);
            } else {
                throw Error('Error here');
            }
        }
    }

    return attempt(1);
}

// const result = await withRetry(
//     () =>
//         new Promise((res, rej) => {
//             setTimeout(() => {
//                 rej(Error('NETWORK_ERROR'));
//             }, 1000);
//         }),
//     {
//         maxAttempts: 5,
//         backoff: 'fixed',
//         initialDelay: 1000,
//         maxDelay: 30000,
//         shouldRetry: (error) => error.code === 'NETWORK_ERROR',
//         onRetry: (attempt, error) =>
//             console.log(`Попытка ${attempt}: ${error.message}`),
//     }
// )
//     .then((data) => console.log(data))
//     .catch((error) => console.log(error));

async function withFallback(...callbacks) {
    for (let index = 0; index < callbacks.length; index++) {
        try {
            return await callbacks[index]();
        } catch (error) {
            if (index === callbacks.length - 1) {
                throw Error(error);
            }
        }
    }
}

// const data = await withFallback(
//     () =>
//         new Promise((res, rej) =>
//             setTimeout(() => {
//                 rej('/api/primary');
//             }, 1000)
//         ),
//     () =>
//         new Promise((res, rej) =>
//             setTimeout(() => {
//                 res('/api/backup');
//             }, 1000)
//         )
// )
//     .then((data) => console.log(data))
//     .catch((error) => console.log(error));

function withCircuitBreaker(fn, options) {
    const { threshold, timeout, resetTimeout } = options;

    let attempts = 0;
    let isBreaker = false;
    let resetTimeoutId,
        timeoutId = null;

    return () => {
        const hasAttempts = attempts < threshold;

        return new Promise(async (resolve, reject) => {
            try {
                if (hasAttempts || !isBreaker) {
                    const result = await fn();
                    resolve(result);
                    attempts = 0;
                    clearTimeout(resetTimeoutId);
                } else {
                    reject(Error('Circuit breaker is OPEN'));
                }
            } catch (error) {
                attempts++;

                if (attempts >= threshold && !isBreaker) {
                    isBreaker = true;

                    resetTimeoutId = setTimeout(() => {
                        attempts = threshold - 1;
                        isBreaker = false;
                    }, resetTimeout);

                    timeoutId = setTimeout(() => {
                        clearTimeout(resetTimeoutId);
                        attempts = 0;
                        isBreaker = false;
                    }, timeout);
                }

                reject(error);
            }
        });
    };
}

// function withCircuitBreaker(fn, options) {
//     const { threshold = 5, timeout = 60000, resetTimeout = 10000 } = options;

//     let state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
//     let errorCount = 0;
//     let resetTimeoutId = null;
//     let timeoutId = null;

//     return async () => {
//         if (state === 'OPEN') {
//             throw new Error('Circuit breaker is OPEN');
//         }

//         try {
//             const result = await fn();

//             // Успех в HALF_OPEN → восстанавливаемся
//             if (state === 'HALF_OPEN') {
//                 state = 'CLOSED';
//                 errorCount = 0;
//                 clearTimeout(timeoutId);
//             }

//             // Успех в CLOSED → сбрасываем счетчик
//             if (state === 'CLOSED') {
//                 errorCount = 0;
//             }

//             return result;
//         } catch (error) {
//             // В HALF_OPEN → сразу в OPEN
//             if (state === 'HALF_OPEN') {
//                 state = 'OPEN';

//                 // Перезапускаем таймер восстановления
//                 clearTimeout(resetTimeoutId);
//                 resetTimeoutId = setTimeout(() => {
//                     state = 'HALF_OPEN';
//                 }, resetTimeout);

//                 throw error;
//             }

//             // В CLOSED считаем ошибки
//             if (state === 'CLOSED') {
//                 errorCount++;

//                 // Достигли порога → открываем breaker
//                 if (errorCount >= threshold) {
//                     state = 'OPEN';

//                     // Таймер для попытки восстановления
//                     resetTimeoutId = setTimeout(() => {
//                         state = 'HALF_OPEN';
//                     }, resetTimeout);

//                     // Таймер принудительного закрытия
//                     timeoutId = setTimeout(() => {
//                         state = 'CLOSED';
//                         errorCount = 0;
//                         clearTimeout(resetTimeoutId);
//                     }, timeout);
//                 }
//             }

//             throw error;
//         }
//     };
// }
// const result = new Promise((resolve, reject) => {
//     try {
//         setTimeout(() => {
//             reject(Error('erro'));
//         }, 1000);
//     } catch (error) {
//         console.log(error, 1);
//     }
// }).catch((error) => console.log(error, 2));

async function withHealthCheck(fn, healthFn) {
    const isHealthy = await healthFn();

    if (!isHealthy) {
        throw new Error('Health check failed');
    }

    return await fn();
}

// const result = await withHealthCheck(
//     () =>
//         new Promise((resolve, reject) =>
//             setTimeout(() => reject('reject'), 1000)
//         ),
//     () => new Promise((resolve) => setTimeout(() => resolve(true), 1000))
// )
//     .then((data) => console.log(data))
//     .catch((error) => console.log(error));

// =================== 12

function createDeferred() {
    let resolve,
        reject = null;
    const promise = new Promise((res, rej) => {
        (resolve = res), (reject = rej);
    });

    return {
        promise,
        resolve,
        reject,
    };
}

const controller = new AbortController();

function createAbortablePromise(executor, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(Error('Aborted'));
            return;
        }
        signal.addEventListener('abort', () => {
            reject(Error('Aborted'));
        });
        executor(resolve, reject, signal);
    });
}

function promiseWithProgress(executor) {
    const listeners = [];

    function progress(value) {
        listeners.forEach((fn) => fn(value));
    }

    return {
        promise: new Promise((resolve, reject) => {
            executor(resolve, reject, progress);
        }),

        onProgress: (fn) => listeners.push(fn),
    };
}

// const promise = promiseWithProgress((resolve, reject, progress) => {
//     let completed = 0;

//     const interval = setInterval(() => {
//         completed += 20;
//         progress(completed / 100); // Отправляем прогресс 0.2, 0.4, 0.6...

//         if (completed >= 100) {
//             clearInterval(interval);
//             resolve('Готово!');
//         }
//     }, 100);
// });

// promise.onProgress((value) => {
//     console.log(`Прогресс-1: ${value * 100}%`);
// });

// promise.onProgress((value) => {
//     console.log(`Прогресс-2: ${value * 100}%`);
// });

function createPromiseTree(dependencies) {
    return {
        execute: async () => {
            const results = {};
            const inProgress = {};

            async function executeTask(name) {
                if (inProgress[name]) {
                    return inProgress[name];
                }

                const task = dependencies[name];

                if (typeof task === 'function') {
                    inProgress[name] = task().then((result) => {
                        results[name] = result;
                        return result;
                    });
                    return inProgress[name];
                }

                if (Array.isArray(task)) {
                    const deps = task.slice(0, -1);
                    const fn = task[task.length - 1];

                    inProgress[name] = Promise.all(
                        deps.map((dep) => executeTask(dep))
                    ).then(async (depResults) => {
                        const result = await fn(...depResults);
                        results[name] = result;
                        return result;
                    });

                    return inProgress[name];
                }
            }

            await Promise.all(
                Object.keys(dependencies).map((name) => executeTask(name))
            );

            return results;
        },
    };
}

const tree = createPromiseTree({
    a: () => new Promise((res, rej) => setTimeout(() => res('a'), 1000)),
    b: [
        'a',
        (a) => new Promise((res, rej) => setTimeout(() => res(`${a}-b`), 1000)),
    ],
    c: [
        'a',
        (a) => new Promise((res, rej) => setTimeout(() => res(`${a}-c`), 1000)),
    ],
    d: [
        'b',
        'c',
        (b, c) =>
            new Promise((res, rej) =>
                setTimeout(() => res(`${b}-${c}-d`), 1000)
            ),
    ],
});

const results = await tree.execute().then((data) => console.log(data));
