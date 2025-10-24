// ================ 13

async function request(url) {
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    }

    throw Error(`Status ${response.status}: ${response.statusText}`);
}

async function fetchUserDataAsync(userId) {
    try {
        const user = await request(`/api/users/${userId}`);
        const posts = await request(`/api/posts?userId=${user.id}`);
        const comment = await request(`/api/comments?postId=${posts[0].id}`);

        return {
            user,
            posts,
            comment,
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ====================== 14

// API симуляция
const api = {
    getUser: (id) =>
        new Promise((resolve) =>
            setTimeout(() => resolve({ id, name: `User${id}` }), 1000)
        ),
    getPosts: (userId) =>
        new Promise((resolve) =>
            setTimeout(
                () => resolve([{ id: 1, userId, title: 'Post 1' }]),
                1000
            )
        ),
    getComments: (postId) =>
        new Promise((resolve) =>
            setTimeout(
                () => resolve([{ id: 1, postId, text: 'Comment' }]),
                1000
            )
        ),
};

async function requestData(callback, arg) {
    try {
        return await api[callback](arg);
    } catch (error) {
        throw new Error(`Failed to ${callback}: ${error.message}`);
    }
}

// Задание 1: Последовательная загрузка (медленно)
async function loadDataSequential(userIds) {
    const results = [];
    for (const id of userIds) {
        try {
            const user = await requestData('getUser', id);
            const posts = await requestData('getPosts', user.id);
            const comments = await requestData('getComments', posts[0].id);

            results.push({
                user,
                posts,
                comments,
            });
        } catch (error) {
            console.error(`Error loading data for user ${id}:`, error);
            return null;
        }
    }
    return results;
}

// Задание 2: Параллельная загрузка (быстро)
async function loadDataParallel(userIds) {
    const promises = userIds.map(async (id) => {
        const user = await requestData('getUser', id);
        const posts = await requestData('getPosts', user.id);
        const comments = await requestData('getComments', posts[0].id);

        return {
            user,
            posts,
            comments,
        };
    });

    return await Promise.all(promises);
}

// Задание 3: Частично параллельная загрузка
async function loadDataMixed(userId) {
    const user = await requestData('getUser', userId);
    const posts = await requestData('getPosts', user.id);
    const comment = await requestData('getComments', posts[0].id);

    return {
        user,
        posts,
        comment,
    };
}

// Задание 4: Promise.allSettled для устойчивости к ошибкам
async function loadDataResilient(userIds) {
    const promises = userIds.map(async (id) => {
        try {
            const user = await api.getUser(id);
            const posts = await api.getPosts(user.id);
            const comments = await api.getComments(posts[0].id);

            return {
                status: 'success',
                data: { user, posts, comments },
            };
        } catch (error) {
            return {
                status: 'failed',
                userId: id,
                error: error.message,
            };
        }
    });

    const results = await Promise.allSettled(promises);

    return results.map((result) => result.value);
}

// Тестирование производительности
async function benchmark() {
    const userIds = [1, 2, 3, 4, 5];

    console.time('Sequential');
    await loadDataSequential(userIds);
    console.timeEnd('Sequential');

    console.time('Parallel');
    await loadDataParallel(userIds);
    console.timeEnd('Parallel');
}

// ================== 15
const unreliableAPI = {
    fetchData: async (id) => {
        if (Math.random() < 0.5) {
            throw new Error(`Failed to fetch data for id: ${id}`);
        }
        return { id, data: `Data for ${id}` };
    },
};

async function fetchWithErrorHandling(id) {
    try {
        return await unreliableAPI.fetchData(id);
    } catch (error) {
        console.error(error);
        return null;
    }
}

// fetchWithErrorHandling(10)
//     .then((data) => console.log(data))
//     .catch((err) => console.log(err, 10));

async function fetchWithRetry(id, maxRetries = 3) {
    let attempts = 0;

    while (attempts <= maxRetries) {
        try {
            return await unreliableAPI.fetchData(id);
        } catch (error) {
            if (attempts === maxRetries) {
                throw error;
            }
            if (attempts > 0) {
                const delay = 100 * Math.pow(2, attempts - 1);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            attempts++;
        }
    }
}

// fetchWithRetry(10)
//     .then((data) => console.log(data))
//     .catch((error) => console.log(error));

const defaultValues = {
    profile: { bio: 'No profile', avatar: null },
    settings: { theme: 'light', notifications: true },
};

async function complexOperation(userId) {
    const result = {
        user: null,
        profile: null,
        settings: null,
    };

    const requestSettings = {
        profile: unreliableAPI.fetchData(`profile-${userId}`),
        settings: unreliableAPI.fetchData(`settings-${userId}`),
    };

    const promises = Object.values(requestSettings);
    const keys = Object.keys(requestSettings);

    try {
        result.user = await unreliableAPI.fetchData(`user-${userId}`);
        const results = await Promise.allSettled(promises);
        results.forEach((promiseResult, index) => {
            const key = keys[index];
            if (promiseResult.status === 'fulfilled') {
                result[key] = promiseResult.value;
            } else {
                result[key] = defaultValues[key];
            }
        });
    } catch (error) {
        throw error;
    }

    return result;
}

class RetryableError extends Error {
    constructor(message, retryAfter = 1000) {
        super(message);
        this.name = 'RetryableError';
        this.retryAfter = retryAfter; // сколько ждать перед retry
    }
}

async function smartRetry(fn, maxRetries = 3) {
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            return await fn();
        } catch (error) {
            if (maxRetries === attempt) {
                throw error;
            }

            if (error instanceof RetryableError || error instanceof Error) {
                ++attempt;
                console.log(`Attempt = ${attempt}`);

                if (error.retryAfter) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, error.retryAfter)
                    );
                }
            } else {
                throw error;
            }
        }
    }
}

// ================== 16

async function* numberGenerator(max) {
    for (let index = 1; index <= max; index++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        yield index;
    }
}

// for await (const num of numberGenerator(5)) {
//     console.log(num);
// }

// async function* paginatedFetch(url, pageSize = 10) {
//     let page = 1;
//     let hasMore = true;

//     while (hasMore) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         if (page > pageSize) {
//             hasMore = false;
//             yield [];
//         } else {
//             page++;
//             yield Array.from(
//                 { length: pageSize },
//                 (_, i) => `Item ${(page - 2) * 5 + i + 1}`
//             );
//         }
//     }
// }

async function* paginatedFetch(url, pageSize = 10) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let data;
        if (page <= 5) {
            data = Array.from({ length: pageSize }, (_, i) => ({
                id: (page - 1) * pageSize + i + 1,
                title: `Item ${(page - 1) * pageSize + i + 1}`,
            }));
        } else {
            data = [];
            hasMore = false;
        }

        page++;
        yield data;
    }
}

// for await (const page of paginatedFetch('/api/items')) {
//     console.log('Page:', page);
// }

async function* eventStream(eventSource) {
    let eventId = 0;
    while (true) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        yield { id: eventId++, data: '', timestamp: Date.now() };
    }
}

// const stream = eventStream('wss://events');
// for await (const event of stream) {
//     console.log('Event:', event);
//     if (event.id > 10) break; // Остановка
// }

async function* compose(...generators) {
    for (const gen of generators) {
        yield* gen();
    }
}

async function* gen1() {
    yield 1;
    yield 2;
}

async function* gen2() {
    yield 'a';
    yield 'b';
}

// const combined = compose(gen1, gen2);
// for await (const val of combined) {
//     console.log(val); // 1, 2, 'a', 'b'
// }

const numbers = numberGenerator(10);

async function* filter(generator, predicate) {
    for await (const gen of generator) {
        if (predicate(gen)) {
            yield gen;
        }
    }
}

async function* map(generator, predicate) {
    for await (const gen of generator) {
        yield predicate(gen);
    }
}

const evens = filter(numbers, (n) => n % 2 === 0);
const doubled = map(evens, (n) => n * 2);

// for await (const num of doubled) {
//     console.log(num); // 4, 8, 12, 16, 20
// }

async function* gen3() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    yield 'a';
}

async function* rateLimitedGenerator(generator, minDelay) {
    let lastYieldTime = 0;

    for await (const value of generator) {
        const now = Date.now();
        const timeSinceLastYield = now - lastYieldTime;

        if (timeSinceLastYield < minDelay) {
            const waitTime = minDelay - timeSinceLastYield;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        yield value;
        lastYieldTime = Date.now();
    }
}

// ========================= 17 ======================

function asyncArrayIterator(arr, delay) {
    return {
        [Symbol.asyncIterator]() {
            let index = 0;
            return {
                async next() {
                    if (index >= arr.length) {
                        return { done: true };
                    }
                    if (delay > 0) {
                        await new Promise((r) => setTimeout(r, delay));
                    }
                    return { value: arr[index++], done: false };
                },
            };
        },
    };
}

// function asyncArrayIterator(arr, delay) {
//     return (async function* () {
//         for (let index = 0; index < arr.length; index++) {
//             if (delay > 0) {
//                 await new Promise((r) => setTimeout(r, delay));
//             }
//             yield arr[index];
//         }
//     })();
// }

// async function testAsyncArrayIterator() {
//     const arr = [1, 2, 3];
//     const delay = 100;
//     const result = [];
//     const start = Date.now();
//     for await (const item of asyncArrayIterator(arr, delay)) {
//         result.push(item);
//     }
//     const duration = Date.now() - start;
//     console.log(
//         result.join(',') === '1,2,3' && duration >= delay * arr.length
//             ? '✅ Passed'
//             : '❌ Failed'
//     );
// }
// testAsyncArrayIterator();

function asyncIntervalIterator(count, delay = 100, onCleanup) {
    return {
        [Symbol.asyncIterator]() {
            let i = 0;
            let stopped = false;
            let cleaned = false;

            const doCleanup = () => {
                if (!cleaned) {
                    cleaned = true;
                    try {
                        if (typeof onCleanup === 'function') onCleanup();
                    } catch (err) {
                        // игнорируем ошибки cleanup
                    }
                }
            };

            return {
                async next() {
                    if (stopped) {
                        return { done: true };
                    }
                    if (i >= count) {
                        doCleanup();
                        return { done: true };
                    }
                    if (delay > 0)
                        await new Promise((r) => setTimeout(r, delay));
                    return { value: i++, done: false };
                },
                async return() {
                    stopped = true;
                    doCleanup();
                    return { done: true };
                },
            };
        },
    };
}

// async function testAsyncIntervalIterator() {
//     let cleaned = false;
//     const iter = asyncIntervalIterator(10, 20, () => {
//         cleaned = true;
//     });
//     let i = 0;
//     for await (const v of iter) {
//         i++;
//         if (i === 3) break; // прерываем после 3-х значений
//     }
//     await new Promise((r) => setTimeout(r, 30)); // дать время на вызов return()
//     console.log(cleaned ? '✅ Passed' : '❌ Failed (cleanup not called)');
// }
// testAsyncIntervalIterator();

// console.log(findSumNodes(tree));

// ===================== 19 =======================

// import { result } from './task19.js';
// console.log(10);
// console.log(result[1], 11);

// ========================= 20 ===========================

function withTimeout(asyncFn, ms) {
    return async (url) => {
        try {
            return await Promise.race([
                asyncFn(url),
                new Promise((_, rej) => setTimeout(rej, ms)),
            ]);
        } catch (error) {
            throw error;
        }
    };
}

function withCache(asyncFn) {
    const cache = new Map();

    return async (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key).result;
        }

        try {
            const result = await asyncFn(args);
            cache.set(args, {
                result,
            });

            return result;
        } catch (error) {
            throw error;
        }
    };
}

// function withConcurrencyLimit(asyncFn, limit) {
//     let active = 0;
//     let result = null;
//     const queue = [];

//     return async (...args) => {
//         return new Promise((resolve, reject) => {
//             const task = async () => {
//                 try {
//                     result = await asyncFn(...args);
//                     resolve(result);
//                 } catch (error) {
//                     reject(error);
//                 } finally {
//                     console.log('finish', result);
//                     active--;
//                     queue.shift()?.();
//                 }
//             };

//             if (active < limit) {
//                 active++;
//                 task();
//             } else {
//                 queue.push(task);
//             }
//         });
//     };
// }

function withConcurrencyLimit(asyncFn, limit) {
    const queue = [];
    let wasRun = false;

    async function run() {
        while (queue.length > 0) {
            const re = queue.pop();
            console.log(re);
            await asyncFn(...re);
        }
    }

    return async (...args) => {
        queue.push(args);
        run();
    };
}
const limitedFetch = withConcurrencyLimit(
    async (...url) => {
        console.log('url', url[1]);
        return new Promise((resolve) => {
            setTimeout(resolve(url[1]), url[0] * 1000);
        });
    },
    2 // максимум 2 одновременно
);
// limitedFetch(1);
Promise.all([
    limitedFetch(1, '1'),
    limitedFetch(2, '2'),
    limitedFetch(5, '3'),
    limitedFetch(4, '4'),
    limitedFetch(5, '5'),
]);
