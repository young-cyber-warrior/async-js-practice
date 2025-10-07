# Модуль 2: Promises в деталях

## 🎯 Цель модуля

Глубокое изучение Promise API, продвинутые паттерны работы с промисами, создание кастомных утилит и оптимизация производительности.

---

## 📝 Задача 6: Promise.prototype.finally

### Описание
Реализовать собственную версию `Promise.prototype.finally` и изучить её особенности.

### Условие
```javascript
// Promise.prototype.finally должен:
// 1. Выполняться и при resolve, и при reject
// 2. НЕ изменять значение или ошибку промиса
// 3. Поддерживать async функции в качестве callback'а

// Пример использования:
Promise.resolve(42)
    .finally(() => console.log('Очистка ресурсов'))
    .then(value => console.log('Результат:', value)); // 42

Promise.reject(new Error('Ошибка'))
    .finally(() => console.log('Очистка при ошибке'))
    .catch(error => console.log('Поймали:', error.message));
```

### Требования
1. Реализуйте `Promise.prototype.finally` как полифил
2. Finally должен выполняться в любом случае
3. Finally НЕ должен изменять результат промиса
4. Поддержка async функций в finally callback
5. Если в finally происходит ошибка - она должна заменить исходный результат

### Пример реализации
```javascript
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function(callback) {
        // Ваша реализация здесь
    };
}
```
---

## 📝 Задача 7: Thenable объекты

### Описание
Изучить работу с thenable объектами и создать свои кастомные thenable'ы.

### Условие
```javascript
// Thenable - объект с методом .then()
// Promise.resolve() автоматически "разворачивает" thenable объекты

const thenable = {
    then(onResolve, onReject) {
        setTimeout(() => onResolve('Thenable результат'), 100);
    }
};

Promise.resolve(thenable)
    .then(result => console.log(result)); // "Thenable результат"
```

### Требования
1. **`createLazyThenable(fn)`** - thenable, который выполняет функцию только при первом .then()
   ```javascript
   const lazy = createLazyThenable(() => {
       console.log('Выполняется только при первом .then()');
       return 'Ленивый результат';
   });
   
   // Функция НЕ выполнится
   const promise1 = Promise.resolve(lazy);
   
   // Функция выполнится только здесь
   promise1.then(result => console.log(result));
   ```

2. **`createCancellableThenable(promise)`** - thenable с возможностью отмены
   ```javascript
   const cancellable = createCancellableThenable(
       fetch('/api/data')
   );
   
   setTimeout(() => cancellable.cancel(), 1000);
   
   cancellable.then(
       result => console.log('Успех:', result),
       error => console.log('Ошибка или отмена:', error)
   );
   ```

3. **`createRetryableThenable(fn, maxRetries)`** - thenable с автоматическими повторами
   ```javascript
   const retryable = createRetryableThenable(
       () => unreliableAPICall(),
       3
   );
   
   retryable.then(result => console.log(result));
   ```

### Файл решения
`solutions/task-07.js`

---

## 📝 Задача 8: Promise композиция и цепочки

### Описание
Создать утилиты для композиции и трансформации promise chains.

### Требования

1. **`pipe(...fns)`** - композиция асинхронных функций
   ```javascript
   const pipeline = pipe(
       async (x) => x * 2,
       async (x) => x + 1,
       async (x) => `Результат: ${x}`
   );
   
   const result = await pipeline(5); // "Результат: 11"
   ```

2. **`map(array, asyncFn, concurrency = Infinity)`** - асинхронный map с контролем параллельности
   ```javascript
   const urls = ['/api/1', '/api/2', '/api/3', '/api/4'];
   
   const results = await map(urls, async (url) => {
       return await fetch(url);
   }, 2); // Максимум 2 запроса параллельно
   ```

3. **`filter(array, asyncPredicate)`** - асинхронный filter
   ```javascript
   const users = [1, 2, 3, 4, 5];
   
   const activeUsers = await filter(users, async (userId) => {
       const user = await getUserById(userId);
       return user.isActive;
   });
   ```

4. **`reduce(array, asyncReducer, initialValue)`** - асинхронный reduce
   ```javascript
   const files = ['file1.txt', 'file2.txt', 'file3.txt'];
   
   const totalSize = await reduce(files, async (acc, filename) => {
       const stats = await getFileStats(filename);
       return acc + stats.size;
   }, 0);
   ```

5. **`waterfall(tasks)`** - последовательное выполнение с передачей результата
   ```javascript
   const result = await waterfall([
       async () => await getUser(1),
       async (user) => await getUserPosts(user.id),
       async (posts) => await getPostComments(posts[0].id)
   ]);
   ```

### Файл решения
`solutions/task-08.js`

---

## 📝 Задача 9: Promise мемоизация

### Описание
Реализовать кэширование результатов асинхронных функций с различными стратегиями.

### Требования

1. **`memoizeAsync(fn, options)`** - базовая мемоизация
   ```javascript
   const memoized = memoizeAsync(async (userId) => {
       console.log(`Загружаем пользователя ${userId}`);
       return await fetchUser(userId);
   });
   
   await memoized(1); // Реальный запрос
   await memoized(1); // Из кэша
   ```

2. **Опции мемоизации:**
   - `ttl` - время жизни кэша в миллисекундах
   - `maxSize` - максимальный размер кэша (LRU eviction)
   - `keyGenerator` - функция для генерации ключей кэша
   - `onHit/onMiss` - коллбэки для статистики

3. **`memoizeWithTTL(fn, ttl)`** - с автоматическим удалением устаревших записей
   ```javascript
   const cached = memoizeWithTTL(expensiveOperation, 60000); // 1 минута
   
   await cached('key1'); // Запрос
   await cached('key1'); // Кэш (если меньше минуты прошло)
   ```

4. **`memoizeWithInvalidation(fn, invalidationFn)`** - с возможностью инвалидации
   ```javascript
   const cached = memoizeWithInvalidation(
       (userId) => fetchUser(userId),
   );
   
   cached.invalidate('user_1'); // Удалить из кэша
   cached.clear(); // Очистить весь кэш
   ```

## 📝 Задача 10: Promise координация

### Описание
Создать утилиты для сложной координации множественных промисов.

### Требования

1. **`PromisePool(concurrency)`** - пул с ограниченной параллельностью
   ```javascript
   const pool = new PromisePool(3);
   
   const promises = urls.map(url => 
       pool.add(() => fetch(url))
   );
   
   const results = await Promise.all(promises);
   ```

2. **`promiseAllWithProgress(promises, onProgress)`** - Promise.all с прогрессом
   ```javascript
   const promises = [
       fetch('/api/1'),
       fetch('/api/2'),
       fetch('/api/3')
   ];
   
   const results = await promiseAllWithProgress(promises, (progress) => {
       console.log(`Выполнено: ${progress.completed}/${progress.total}`);
   });
   ```

3. **`promiseRaceWithTimeout(promises, timeout)`** - race с таймаутом
   ```javascript
   try {
       const result = await promiseRaceWithTimeout([
           fetch('/api/slow'),
           fetch('/api/fast')
       ], 5000);
   } catch (error) {
       console.log('Все промисы либо упали, либо превысили таймаут');
   }
   ```

4. **`promiseChain(tasks)`** - цепочка зависимых задач
   ```javascript
   const result = await promiseChain([
       { name: 'auth', task: () => authenticate() },
       { name: 'user', task: (auth) => getUser(auth.userId) },
       { name: 'posts', task: (user) => getUserPosts(user.id) }
   ]);
   
   // result = { auth: {...}, user: {...}, posts: [...] }
   ```
---

## 📝 Задача 11: Error recovery паттерны

### Описание
Реализовать продвинутые паттерны восстановления после ошибок.

### Требования
Проблема: Сетевые запросы могут временно падать. Нужен умный механизм повторов.
fn - функция для выполнения
options:
    maxAttempts - максимум попыток (по умолчанию 3)
    backoff - стратегия: 'fixed', 'linear', 'exponential' (по умолчанию 'exponential')
    initialDelay - начальная задержка в ms (по умолчанию 1000)
    maxDelay - максимальная задержка в ms (по умолчанию 30000)
    shouldRetry - функция проверки, стоит ли повторять (по умолчанию всегда true)
    onRetry - callback при каждом повторе

Если ошибка и shouldRetry(error) === true и попытки не исчерпаны:
    Вызвать onRetry(attemptNumber, error)
    Подождать согласно стратегии
    Повторить
Если успех или попытки исчерпаны - вернуть результат/ошибку

1. **`withRetry(fn, options)`** - гибкие повторы с различными стратегиями
   ```javascript
   const result = await withRetry(unreliableFunction, {
       maxAttempts: 5,
       backoff: 'exponential', // 'linear', 'exponential', 'fixed'
       initialDelay: 1000,
       maxDelay: 30000,
       shouldRetry: (error) => error.code === 'NETWORK_ERROR',
       onRetry: (attempt, error) => console.log(`Попытка ${attempt}: ${error.message}`)
   });
   ```
### Требования
    primary - основная функция (возвращает промис)
    fallback - резервная функция (возвращает промис)

    Попытаться выполнить primary()
    Если primary выполнилась успешно - вернуть её результат
    Если primary упала с ошибкой - выполнить fallback()
    Если fallback тоже упала - пробросить ошибку от fallback

2. **`withFallback(primary, fallback)`** - fallback к альтернативному источнику
   ```javascript
   const data = await withFallback(
       () => fetch('/api/primary'),
       () => fetch('/api/backup')
   );
   ```
### Требования
fn - функция для защиты
options:
    threshold - количество ошибок для открытия (по умолчанию 5)
    timeout - время в открытом состоянии в ms (по умолчанию 60000)
    resetTimeout - время до попытки восстановления в ms (по умолчанию 30000)
CLOSED (замкнут) - всё работает, пропускаем запросы
OPEN (разомкнут) - много ошибок, блокируем запросы
HALF_OPEN (полуоткрыт) - пробуем восстановиться
В состоянии CLOSED: выполнять функцию, считать ошибки
В состоянии OPEN: сразу кидать ошибку "Circuit breaker is OPEN"
В состоянии HALF_OPEN: попробовать выполнить, если успех → CLOSED, если ошибка → OPEN

3. **`withCircuitBreaker(fn, options)`** - circuit breaker паттерн
   ```javascript
   const protected = withCircuitBreaker(unreliableService, {
       threshold: 5,        // Количество ошибок для открытия
       timeout: 60000,      // Время в открытом состоянии
       resetTimeout: 30000  // Время до попытки восстановления
   });
   ```

### Требования
Входные параметры:
    fn - основная функция для выполнения
    healthFn - функция проверки здоровья (возвращает true/false или промис)
Что должна делать функция:
    Сначала выполнить healthFn() для проверки состояния
    Если healthFn() вернула true - выполнить основную функцию
    Если healthFn() вернула false - кинуть ошибку "Health check failed"
    Если healthFn() упала с ошибкой - пробросить эту ошибку

4. **`withHealthCheck(fn, healthFn)`** - выполнение с проверкой состояния
   ```javascript
   const result = await withHealthCheck(
       () => databaseQuery(),
       () => checkDatabaseConnection()
   );
   ```
---

## 📝 Задача 12: Promise.withResolvers и продвинутые паттерны

### Описание
Изучить современные Promise паттерны и создать advanced утилиты.

### Требования

1. **Реализовать `Promise.withResolvers()` полифил**
   ```javascript
   function createDeferred() {
       // Ваша реализация Promise.withResolvers
   }
   
   const { promise, resolve, reject } = createDeferred();
   
   setTimeout(() => resolve('Готово!'), 1000);
   const result = await promise;
   ```
### Требования
Входные параметры:
    executor - функция как в обычном Promise, но получает (resolve, reject, signal)
    signal - AbortSignal от AbortController

Что должна делать функция:
    Вернуть новый Promise
    При создании промиса:
    Если signal.aborted === true - сразу reject с new Error('Aborted')
    Иначе добавить listener на событие 'abort' сигнала
    При срабатывании abort:
    Сделать reject с new Error('Aborted')
    Вызвать executor с тремя параметрами: resolve, reject, signal

2. **`createAbortablePromise(executor, signal)`** - промис с AbortController
   ```javascript
   const controller = new AbortController();
   createAbortablePromise((resolve, reject, signal) => {
    setTimeout(() => resolve('Данные'), 5000),
    controller.signal
   })

   ```

### Требования
Входные параметры:
    executor - функция вида (resolve, reject, progress) => void
    progress - функция для отправки прогресса (принимает число от 0 до 1)

Что должна делать функция:
    Вернуть объект-промис с дополнительным методом onProgress
    Метод onProgress(callback):
    Принимает callback функцию
    Callback вызывается каждый раз когда executor вызывает progress(value)
    Можно подписать несколько listeners

Промис должен работать как обычный - можно делать await, then, catch

3. **`promiseWithProgress(executor)`** - промис с отчетом о прогрессе
   ```javascript
   const promise = promiseWithProgress((resolve, reject, progress) => {
       let completed = 0;
       const total = 100;
       
       const interval = setInterval(() => {
           completed += 10;
           progress(completed / total);
           
           if (completed >= total) {
               clearInterval(interval);
               resolve('Завершено!');
           }
       }, 100);
   });
   
   promise.onProgress((ratio) => {
       console.log(`Прогресс: ${Math.round(ratio * 100)}%`);
   });
   
   const result = await promise;
   ```

### Требования
Входные параметры:
    dependencies - объект, где каждый ключ это:
    Функция без зависимостей: () => promise
    Массив с зависимостями: [dep1, dep2, ..., (результаты) => promise]
Что должна делать функция:
Вернуть объект с методом execute()

Метод execute():
    Выполняет задачи в правильном порядке (с учетом зависимостей)
    Параллелит независимые задачи
    Возвращает объект с результатами всех задач
Логика зависимостей:
    Задача может зависеть от других по имени
    Зависимые задачи получают результаты тех, от кого зависят

4. **`createPromiseTree(dependencies)`** - дерево зависимостей
   ```javascript
   const tree = createPromiseTree({
       a: () => fetchA(),
       b: ['a', (a) => fetchB(a)],
       c: ['a', (a) => fetchC(a)],
       d: ['b', 'c', (b, c) => fetchD(b, c)]
   });
   
   const results = await tree.execute();
   // { a: resultA, b: resultB, c: resultC, d: resultD }
   ```
