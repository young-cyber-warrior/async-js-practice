# Модуль 3: Async/Await

## 🎯 Цель модуля

Современный синтаксис асинхронного программирования

---

## 📝 Задача 13: Базовый async/await синтаксис

### Описание

Переписать цепочку промисов на async/await синтаксис. Научиться преобразовывать промисы в более читаемый код.

### Требования

Функция с async/await должна работать идентично версии с промисами
Код становится более читаемым и последовательным
Функция delay должна приостанавливать выполнение на указанное время

### Условие

```javascript
function fetchUserData(userId) {
    return fetch(`/api/users/${userId}`)
        .then((response) => response.json())
        .then((user) => {
            return fetch(`/api/posts?userId=${user.id}`);
        })
        .then((response) => response.json())
        .then((posts) => {
            return fetch(`/api/comments?postId=${posts[0].id}`);
        })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error:', error);
            return null;
        });
}

async function fetchUserDataAsync(userId) {
    // Ваш код здесь
}

async function delay(ms) {
    // Реализовать задержку используя Promise и setTimeout
}
```

---

## 📝 Задача 14: Параллельные vs последовательные операции

### Описание

Понять разницу между последовательным и параллельным выполнением async операций. Оптимизировать производительность.

### Условие

```javascript
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

// Задание 1: Последовательная загрузка (медленно)
async function loadDataSequential(userIds) {
    const results = [];
    // TODO: Загрузить данные для каждого пользователя последовательно
    // Замерить время выполнения
    return results;
}

// Задание 2: Параллельная загрузка (быстро)
async function loadDataParallel(userIds) {
    // TODO: Загрузить данные для всех пользователей параллельно
    // Использовать Promise.all
    return results;
}

// Задание 3: Частично параллельная загрузка
async function loadDataMixed(userId) {
    // TODO: Загрузить user, затем параллельно posts и comments
    // Оптимизировать где возможно
}

// Задание 4: Promise.allSettled для устойчивости к ошибкам
async function loadDataResilient(userIds) {
    // TODO: Загрузить данные, даже если некоторые запросы fail
    // Использовать Promise.allSettled
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
```

---

## 📝 Задача 15: Обработка ошибок с try/catch

### Условие

```javascript
// Нестабильное API (50% шанс ошибки) - НЕ ИЗМЕНЯТЬ!
const unreliableAPI = {
    fetchData: async (id) => {
        if (Math.random() < 0.5) {
            throw new Error(`Failed to fetch data for id: ${id}`);
        }
        return { id, data: `Data for ${id}` };
    },
};
```

### Требования

Задание 1: fetchWithErrorHandling
Базовая обработка ошибок:

Принимает id
Использует try/catch для вызова unreliableAPI.fetchData(id)
При успехе возвращает полученные данные
При ошибке логирует её и возвращает null
НЕ должна выбрасывать ошибку наружу

Задание 2: fetchWithRetry
Механизм повторных попыток с exponential backoff:

Принимает id и maxRetries (по умолчанию 3)
При ошибке пытается ещё раз, максимум maxRetries раз
Между попытками делает задержку:

1-я попытка: без задержки
2-я попытка: 100ms задержка
3-я попытка: 200ms задержка
4-я попытка: 400ms задержка (exponential backoff)

Если все попытки неудачны - выбрасывает последнюю ошибку
При успехе возвращает данные

Формула задержки: delay = 100 \* Math.pow(2, attemptNumber - 2) для attempt >= 2

Задание 3: complexOperation
Множественные try/catch блоки для разных уровней критичности:

```javascript
async function complexOperation(userId) {
    let user, profile, settings;

    // TODO: Реализовать логику:
    // 1. user - ОБЯЗАТЕЛЬНЫЙ (если не получили - выбросить ошибку)
    // 2. profile - опциональный (при ошибке использовать defaultProfile)
    // 3. settings - опциональный (при ошибке использовать defaultSettings)

    const defaultProfile = { bio: 'No profile', avatar: null };
    const defaultSettings = { theme: 'light', notifications: true };

    return { user, profile, settings };
}
```

Задание 4: Класс RetryableError и smartRetry
Создать умную систему retry с разными стратегиями:

```javascript
class RetryableError extends Error {
    constructor(message, retryAfter = 1000) {
        super(message);
        this.name = 'RetryableError';
        this.retryAfter = retryAfter; // сколько ждать перед retry
    }
}

async function smartRetry(fn, maxRetries = 3) {
    // TODO: Реализовать логику:
    // - Если RetryableError - ждать указанное время retryAfter
    // - Если обычная Error - retry немедленно
    // - Если не Error - пробросить дальше
    // - Вести счётчик попыток
    // - Логировать каждую попытку
}
```

## 📝 Задача 16: Async генераторы

### Требования

Задание 1: numberGenerator
Создать базовый async генератор чисел:

```javascript
async function* numberGenerator(max) {
    // TODO: Генерировать числа от 1 до max
    // Каждое число через 100ms задержку
    // yield каждое число
}

// Использование:
for await (const num of numberGenerator(5)) {
    console.log(num); // 1, 2, 3, 4, 5 (с задержкой между числами)
}
```

### Требования

Задание 2: paginatedFetch
Генератор для постраничной загрузки данных:

```javascript
async function* paginatedFetch(url, pageSize = 10) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        // TODO: Загружать страницу данных
        // Симулировать API запрос с await
        // yield страницу данных
        // Остановиться когда данных больше нет
        // Для симуляции используй:
        // - Страницы 1-5 возвращают данные
        // - Страница 6+ возвращает пустой массив
    }
}

// Использование:
for await (const page of paginatedFetch('/api/items')) {
    console.log('Page:', page);
    // Можно прервать если нужно
    if (someCondition) break;
}
```

### Требования

Задание 3: eventStream
Бесконечный генератор событий:

```javascript
async function* eventStream(eventSource) {
    // TODO: Создать генератор для потока событий
    // Симулировать получение событий каждые 500ms
    // Генерировать события бесконечно
    // Позволить остановку через break или return

    let eventId = 0;
    while (true) {
        // Симуляция получения события
        // yield { id: eventId++, data: ..., timestamp: ... }
    }
}

// Использование:
const stream = eventStream('wss://events');
for await (const event of stream) {
    console.log('Event:', event);
    if (event.id > 10) break; // Остановка
}
```

### Требования

Задание 4: compose
Объединение нескольких генераторов:

```javascript
async function* compose(...generators) {
    // TODO: Объединить несколько async генераторов в один
    // Выдавать значения из всех генераторов последовательно
    // Пример:
    // gen1 yields: 1, 2, 3
    // gen2 yields: 'a', 'b'
    // compose(gen1, gen2) yields: 1, 2, 3, 'a', 'b'
}
```

### Требования

Задание 5: filter и map
Утилиты для трансформации генераторов:

```javascript
async function* filter(generator, predicate) {
    // TODO: Фильтровать значения из генератора
    // yield только те, которые проходят predicate
}

async function* map(generator, transform) {
    // TODO: Трансформировать каждое значение из генератора
    // yield трансформированное значение
}

// Использование:
const numbers = numberGenerator(10);
const evens = filter(numbers, (n) => n % 2 === 0);
const doubled = map(evens, (n) => n * 2);

for await (const num of doubled) {
    console.log(num); // 4, 8, 12, 16, 20
}
```

### Требования

Задание 6: rateLimitedGenerator
Контроль скорости выдачи значений:

```javascript
async function* rateLimitedGenerator(generator, minDelay) {
    // TODO: Ограничить скорость выдачи значений
    // Между yield должно пройти минимум minDelay ms
    // Даже если исходный генератор быстрее
}
```

## 📝 Задача 17: For-await-of циклы

### Требования

Задача 1: Асинхронный итератор для массива с задержкой
Требования:
Реализуй функцию asyncArrayIterator(arr, delay), которая принимает массив и задержку (в мс). Функция должна возвращать асинхронный итератор, который по for-await-of будет выдавать элементы массива с указанной задержкой между элементами.

Проверочный код:

```javascript
async function testAsyncArrayIterator() {
    const arr = [1, 2, 3];
    const delay = 100;
    const result = [];
    const start = Date.now();
    for await (const item of asyncArrayIterator(arr, delay)) {
        result.push(item);
    }
    const duration = Date.now() - start;
    console.log(
        result.join(',') === '1,2,3' && duration >= delay * arr.length
            ? '✅ Passed'
            : '❌ Failed'
    );
}
testAsyncArrayIterator();
```

## 📝 Задача 19: Top-level await

Top-level await позволяет использовать await в корне модуля без обёртки в async функцию. Это упрощает работу с асинхронным кодом в модулях.

### Требования

Задача 1:
Создай модуль, который загружает данные с помощью top-level await
Используй fetch() или симуляцию задержки с setTimeout
Экспортируй загруженные данные

Задача 2:
Обработка ошибок:

Обработай ошибки загрузки на уровне модуля с try/catch
Предоставь fallback значения при ошибке
Логируй информацию о загрузке

Задача 4:
Условная загрузка:

Загружай данные только при выполнении определённого условия
Используй окружающие переменные или конфиг
Экспортируй флаг готовности данных

## 📝 Задача 20: Async функции высшего порядка

Принимают другие функции как аргументы
Возвращают функции
Работают с асинхронным кодом

### Требования

Задача 1:
Создай две функции высшего порядка:

withTimeout(asyncFn, ms) — если функция выполняется дольше ms, выбрасывает ошибку "Timeout"

Задача 2:
Создай функцию withCache(asyncFn):

Принимает async функцию
Возвращает функцию, которая кеширует результаты
Если функцию вызвали с теми же аргументами — возвращает результат из кеша
Если с новыми аргументами — выполняет функцию заново

Задача 3:
Создай функцию withConcurrencyLimit(asyncFn, limit):

Принимает async функцию и максимальное количество одновременных выполнений
Если запущено уже limit функций, новые ждут в очереди
Когда одна функция завершается, следующая из очереди начинает выполняться
