//  =================== 21

// ==== debounce 1 обратобка ошибок тольок в переданной функции

// function debounce(func, delay) {
//     let timeoutID = null;

//     return async (...args) => {
//         clearTimeout(timeoutID);
//         await new Promise((resolve) => {
//             timeoutID = setTimeout(() => resolve(), delay);
//         });
//         return await func(...args);
//     };
// }

// ==== debounce 2 добавляем логику обработки ошибок

function debounce(func, delay) {
    let timeoutID = null;

    return (...args) => {
        clearTimeout(timeoutID);
        return new Promise((resolve, reject) => {
            timeoutID = setTimeout(async () => {
                try {
                    const result = await func(...args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    };
}

// ==== throttle

function throttle(func, interval) {
    let lastCallTime = 0;

    return function (...args) {
        return new Promise((resolve, reject) => {
            const now = Date.now();

            if (now - lastCallTime >= interval) {
                lastCallTime = now;

                Promise.resolve(func.apply(this, args))
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve(undefined);
            }
        });
    };
}

// ================== PromiseQueue  ==================

class PromiseQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.queue = [];
        this.amountRunTack = 0;
        this.isPaused = false;
    }

    add(taskFn, priority = 0) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                taskFn,
                resolve,
                reject,
                priority,
            });

            this.runNextTask();
        });
    }

    getPriorityTask() {
        const maxIndex = this.queue.reduce(
            (maxIdx, item, idx) =>
                this.queue[maxIdx].priority >= item.priority ? maxIdx : idx,
            0
        );

        return this.queue.splice(maxIndex, 1)[0];
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.runNextTask();
    }

    async runNextTask() {
        if (this.amountRunTack >= this.concurrency || this.queue.length === 0) {
            return;
        }

        if (this.isPaused) {
            return;
        }

        this.amountRunTack++;

        const { taskFn, resolve, reject } = this.getPriorityTask();

        try {
            const result = await taskFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.amountRunTack--;
            this.runNextTask();
        }
    }
}

const queue = new PromiseQueue(1); // максимум 2 одновременно

// queue.add(async () => {
//     await new Promise((r) => setTimeout(r, 500));
//     console.log('Задача 1');
// });

// queue.add(async () => {
//     await new Promise((r) => setTimeout(r, 500));
//     console.log('Задача 2');
// });

// queue.add(async () => {
//     await new Promise((r) => setTimeout(r, 500));
//     console.log('Задача 3');
// });

// queue.add(async () => {
//     await new Promise((r) => setTimeout(r, 500));
//     console.log('Задача 4');
// });

// // После 600ms включаем паузу
// setTimeout(() => {
//     console.log('⏸ ПАУЗА');
//     queue.pause();
// }, 600);

// setTimeout(() => {
//     console.log('▶ ВОЗОБНОВЛЕНИЕ');
//     queue.resume();
// }, 2000);

// class Semaphore {
//     constructor(maxConcurrency) {
//         this.concurrency = maxConcurrency;
//         this.queue = [];
//         this.amountFreeSlots = 0;
//     }

//     release() {
//         this.amountFreeSlots--;
//         this.runTaskByFreeSlot();
//     }

//     async acquire() {
//         return await new Promise((resolve) => {
//             this.queue.push({
//                 resolve,
//             });
//             this.runTaskByFreeSlot();
//         });
//     }

//     async runTaskByFreeSlot() {
//         if (
//             this.amountFreeSlots >= this.concurrency ||
//             this.queue.length === 0
//         ) {
//             return;
//         }

//         this.amountFreeSlots++;

//         const { resolve } = this.queue.pop();
//         resolve();
//     }
// }

class Semaphore {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.amountFreeSlots = maxConcurrency;
        this.waitingQueue = [];
        this.currentResolve = null;
    }

    acquire() {
        return new Promise((resolve) => {
            if (this.amountFreeSlots > 0) {
                this.amountFreeSlots--;
                this.currentResolve = resolve;
                resolve();
            } else {
                this.waitingQueue.push(resolve);
            }
        });
    }

    release() {
        if (this.waitingQueue.length > 0) {
            const resolve = this.waitingQueue.shift();
            resolve();
        } else {
            this.amountFreeSlots++;
        }
    }

    getAvailable() {
        return this.amountFreeSlots;
    }

    async acquireWithTimeout(ms) {
        return await Promise.race([
            this.acquire(),
            new Promise((_, rej) => {
                const currentResolve = this.currentResolve;
                setTimeout(() => {
                    const index = this.waitingQueue.indexOf(currentResolve);
                    this.waitingQueue.splice(index, 1);
                    rej(new Error('Timeout'));
                }, ms);
            }),
        ]);
    }

    async with(fn) {
        try {
            await this.acquire();
            return await fn();
        } catch (error) {
            throw error;
        } finally {
            this.release();
        }
    }
}

// const semaphore = new Semaphore(1); // максимум 2 одновременно

// async function useResource(id) {
//     console.log(`🔄 Клиент ${id} попросил слот`);

//     await semaphore.acquire();
//     console.log(`✅ Клиент ${id} получил слот`);

//     // Используем ресурс
//     await new Promise((r) => setTimeout(r, 1000));
//     console.log(`📊 Клиент ${id} использует ресурс`);

//     semaphore.release();
//     console.log(`🔓 Клиент ${id} освободил слот`);
// }

// Promise.all([
//     useResource(1),
//     useResource(2),
//     useResource(3),
//     useResource(4),
//     useResource(5),
// ]);

// async function checkTimeout() {
//     const sem = new Semaphore(1);

//     sem.acquire(); // захватываем единственный слот

//     try {
//         await sem.acquireWithTimeout(100);
//         return false; // не должны дойти сюда
//     } catch (error) {
//         return error.message.includes('Timeout');
//     }
// }

// checkTimeout()
//     .then((data) => console.log(data, 1))
//     .catch(console.log);

// async function checkNoTimeout() {
//     const sem = new Semaphore(1);

//     try {
//         await sem.acquireWithTimeout(100);
//         sem.release();
//         return true; // получили слот без timeout
//     } catch (error) {
//         return false;
//     }
// }
// checkNoTimeout()
//     .then((data) => console.log(data, 1))
//     .catch(console.log);

// async function checkTimeoutNoCapture() {
//     const sem = new Semaphore(1);

//     sem.acquire(); // занимаем слот

//     try {
//         await sem.acquireWithTimeout(100);
//     } catch (error) {
//         // timeout сработал
//     }

//     // Проверяем, что слот всё ещё занят и не добавлен в очередь
//     return sem.amountFreeSlots === 1; // всё ещё 1 используемый (клиент 1)
// }

// checkTimeoutNoCapture()
//     .then((data) => console.log(data, 1))
//     .catch(console.log);

// Проверка 4: несколько timeouts
// async function checkMultipleTimeouts() {
//     const sem = new Semaphore(1);
//     let timeoutCount = 0;

//     sem.acquire();

//     const t1 = sem.acquireWithTimeout(100).catch(() => timeoutCount++);
//     const t2 = sem.acquireWithTimeout(100).catch(() => timeoutCount++);
//     const t3 = sem.acquireWithTimeout(100).catch(() => timeoutCount++);

//     await Promise.all([t1, t2, t3]);

//     return timeoutCount === 3; // все три timeout'а
// }
