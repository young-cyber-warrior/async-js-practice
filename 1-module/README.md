# Модуль 1: Основы асинхронности

## 🎯 Цель модуля

Изучить фундаментальные концепции асинхронного программирования в JavaScript: Event Loop, callbacks, основы Promise API и обработки ошибок.

---

## 📝 Задача 1: Понимание Event Loop

### Описание
Предскажите порядок выполнения кода и объясните работу Event Loop.

### Условие
Проанализируйте следующий код:

```javascript
console.log('1');

setTimeout(() => {
    console.log('2');
}, 0);

Promise.resolve().then(() => {
    console.log('3');
});

console.log('4');

setTimeout(() => {
    console.log('5');
}, 0);

Promise.resolve().then(() => {
    console.log('6');
}).then(() => {
    console.log('7');
});

console.log('8');
```

### Требования
1. Напишите ожидаемый порядок вывода
2. Объясните работу Event Loop на этом примере
3. Объясните разницу между Task Queue и Microtask Queue

---

## 📝 Задача 2: Callback Hell

### Описание
Переписать callback hell в читаемый код используя Promises и async/await.

### Условие
Дан код с nested callbacks:

```javascript
function getUserData(userId, callback) {
    setTimeout(() => {
        console.log('Получили пользователя');
        callback(null, { id: userId, name: 'John' });
    }, 100);
}

function getUserPosts(userId, callback) {
    setTimeout(() => {
        console.log('Получили посты пользователя');
        callback(null, [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]);
    }, 150);
}

function getPostComments(postId, callback) {
    setTimeout(() => {
        console.log('Получили комментарии поста');
        callback(null, [{ id: 1, text: 'Great post!' }]);
    }, 80);
}

// Callback Hell:
getUserData(1, (err, user) => {
    if (err) return console.error(err);
    
    getUserPosts(user.id, (err, posts) => {
        if (err) return console.error(err);
        
        getPostComments(posts[0].id, (err, comments) => {
            if (err) return console.error(err);
            
            console.log('Результат:', {
                user,
                posts,
                comments
            });
        });
    });
});
```

### Требования
1. Переписать используя Promises (создайте промис-версии функций)
2. Переписать используя async/await
3. Добавить правильную обработку ошибок для обеих версий

---

## 📝 Задача 3: Promise.all vs Promise.race

### Описание
Изучить методы Promise API для работы с множественными асинхронными операциями.

### Условие
Даны независимые API функции:

```javascript
function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id, name: `User${id}`, role: 'user' });
        }, Math.random() * 1000 + 500); // 500-1500ms
    });
}

function fetchWeather(city = 'Moscow') {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error('Weather service down'));
            } else {
                resolve({ city, temp: 22, condition: 'sunny' });
            }
        }, Math.random() * 800 + 200); // 200-1000ms
    });
}

function fetchNews() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.3) {
                reject(new Error('News service timeout'));
            } else {
                resolve([
                    { title: 'Breaking News 1' },
                    { title: 'Breaking News 2' }
                ]);
            }
        }, Math.random() * 600 + 100); // 100-700ms
    });
}

function fetchCurrency() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ USD: 75.5, EUR: 89.2 });
        }, Math.random() * 400 + 300); // 300-700ms
    });
}
```

### Требования
Реализуйте 4 функции:

1. **`loadDashboard()`** - используя Promise.all()
   - Загружает все данные параллельно
   - Если хотя бы один запрос упадет - вся операция падает

2. **`loadFastest()`** - используя Promise.race()
   - Возвращает результат самой быстрой операции

3. **`loadDashboardSafe()`** - используя Promise.allSettled()
   - Загружает все данные, но не падает при ошибках
   - Возвращает информацию о том, что загрузилось успешно/с ошибкой

4. **`loadAnySuccessful()`** - используя Promise.any()
   - Возвращает первый успешный результат, игнорируя ошибки

### Файл решения
`solutions/task-03.js`

---

## 📝 Задача 4: Обработка ошибок в Promise chains

### Описание
Изучить различные стратегии обработки ошибок в асинхронном коде.

### Условие
Даны API функции, которые могут падать:

```javascript
function fetchUserProfile(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId <= 0) {
                reject(new Error('Invalid user ID'));
            } else if (Math.random() < 0.3) {
                reject(new Error('User service unavailable'));
            } else {
                resolve({ 
                    id: userId, 
                    name: `User ${userId}`, 
                    email: `user${userId}@example.com` 
                });
            }
        }, 300);
    });
}

function fetchUserSettings(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.4) {
                reject(new Error('Settings service down'));
            } else {
                resolve({ 
                    userId, 
                    theme: 'dark', 
                    notifications: true 
                });
            }
        }, 200);
    });
}

function updateUserLastSeen(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error('Analytics service error'));
            } else {
                resolve({ userId, lastSeen: new Date() });
            }
        }, 100);
    });
}
```

### Требования
Реализуйте 4 функции с разными стратегиями:

1. **`loadUserWithRetry(userId, maxRetries = 3)`**
   - При ошибке в fetchUserProfile повторяет запрос до maxRetries раз
   - Логирует каждую попытку
   - Если все попытки неудачны - выбрасывает последнюю ошибку

2. **`loadUserWithFallback(userId)`**
   - Пытается загрузить полный профиль + настройки
   - При ошибках использует дефолтные значения
   - Никогда не падает (всегда возвращает результат)

3. **`loadUserSafelyWithLogging(userId)`**
   - Выполняет все три операции параллельно
   - При ошибках НЕ прерывает выполнение, а логирует их
   - Возвращает объект: `{ data: {...}, errors: [...] }`

4. **`loadUserWithTimeout(userId, timeoutMs = 1000)`**
   - Загружает профиль пользователя
   - Если операция занимает больше timeoutMs - отменяет её
   - Создайте собственный Promise с таймаутом

---

## 📝 Задача 5: Создание собственных Promise

### Описание
Изучаем работу с реальными API - правильную обработку HTTP статусов, headers, и различных типов ошибок сети.

### Условие
Вы работаете с API, который может возвращать разные HTTP статусы и типы ошибок:

### Требования

```javascript
// Симуляция реального API
function simulateAPICall(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const random = Math.random();
            
            // Симуляция различных сценариев
            if (random < 0.1) {
                // Сетевая ошибка
                reject(new Error('Network Error: Connection failed'));
            } else if (random < 0.2) {
                // 404 Not Found
                resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({ error: 'User not found', code: 'USER_NOT_FOUND' })
                });
            } else if (random < 0.3) {
                // 401 Unauthorized
                resolve({
                    ok: false,
                    status: 401,
                    statusText: 'Unauthorized',
                    json: () => Promise.resolve({ error: 'Invalid token', code: 'INVALID_TOKEN' })
                });
            } else if (random < 0.4) {
                // 500 Server Error
                resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: () => Promise.resolve({ error: 'Database connection failed', code: 'DB_ERROR' })
                });
            } else if (random < 0.5) {
                // 429 Too Many Requests
                resolve({
                    ok: false,
                    status: 429,
                    statusText: 'Too Many Requests',
                    headers: { get: (name) => name === 'Retry-After' ? '60' : null },
                    json: () => Promise.resolve({ error: 'Rate limit exceeded', retryAfter: 60 })
                });
            } else {
                // 200 Success
                resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: () => Promise.resolve({ 
                        id: 1, 
                        name: 'John Doe', 
                        email: 'john@example.com',
                        data: endpoint === '/users/profile' ? { age: 30 } : { posts: [] }
                    })
                });
            }
        }, Math.random() * 1000 + 200); // 200-1200ms задержка
    });
}
```

### Требования
Реализуйте 4 функции с разными стратегиями:

1. **`apiRequest(endpoint, options = {})`**
    - Универсальная функция для API запросов
    - Правильно обрабатывает все HTTP статусы (200, 400, 401, 404, 429, 500+)
    - Для статуса 429 извлекает Retry-After header
    - Возвращает данные при успехе, выбрасывает специфичные ошибки при неудаче
    - Формат ошибок: { message, status, code, retryAfter? }
2. **`fetchUserWithRetry(userId, maxRetries = 3)`**
    - Использует apiRequest() для загрузки пользователя
    - При ошибках 5xx и сетевых ошибках - повторяет запрос
    - При 4xx ошибках (клиентские) - НЕ повторяет
    - При 429 - ждет время указанное в Retry-After
    - Логирует каждую попытку с деталями
3. **`fetchMultipleUsers(userIds, concurrency = 3)`**
    - Загружает несколько пользователей с ограничением параллельности
    - Не более concurrency запросов одновременно
    - Возвращает { successful: [...], failed: [...] }
    - При ошибках продолжает загрузку остальных
4. **`smartApiRequest(endpoint, options = {})`**
    - "Умная" обертка над apiRequest()
    - Автоматически повторяет запросы при recoverable ошибках
    - Логирует детальную информацию для дебага
    - Применяет exponential backoff для повторов
    - Backoff: 1s, 2s, 4s, 8s...
---

## 📝 Задача 6: Throttling и Debouncing

### Описание
Изучаем техники контроля частоты вызовов функций - throttling для ограничения максимальной частоты и debouncing для отложенного выполнения.

### Условие
```javascript
Вам нужно реализовать функции для оптимизации производительности веб-приложени

// Симуляция API для поиска
function searchAPI(query) {
    return new Promise((resolve) => {
        console.log(`🔍 Поиск: "${query}"`);
        setTimeout(() => {
            resolve([
                `Результат 1 для "${query}"`,
                `Результат 2 для "${query}"`,
                `Результат 3 для "${query}"`
            ]);
        }, Math.random() * 500 + 100);
    });
}

// Симуляция обновления UI
function updateUI(data) {
    console.log(`🎨 Обновление UI:`, data.length, 'элементов');
    return Promise.resolve();
}

// Симуляция аналитики
function trackEvent(eventType, data) {
    console.log(`📊 Трек событие: ${eventType}`, data);
    return Promise.resolve();
}
```

### Требования
Реализуйте 4 функции с разными стратегиями:

1. **`debounce(func, delay)`**
    - Классический debounce - откладывает выполнение функции
    - Если функция вызывается повторно до истечения delay - сбрасывает таймер
    - Выполняет функцию только после того, как прошло delay мс с последнего вызова
    - Поддерживает async функции
    - Возвращает Promise с результатом выполнения
2. **`throttle(func, interval)`**
    - Классический throttle - ограничивает частоту вызовов
    - Выполняет функцию максимум один раз в interval мс
    - Первый вызов выполняется немедленно
    - Последующие вызовы игнорируются, пока не пройдет interval
    - Поддерживает async функции
3. **`smartSearch(query)`**
    - "Умная" функция поиска с debouncing
    - Использует debounce с задержкой 300мс для вызова searchAPI
    - Отменяет предыдущие поиски, если запрос изменился
    - Обрабатывает race conditions (если старый запрос вернулся после нового)
    - Кэширует результаты на 30 секунд
4. **`trackUserActivity(activityType, details)`**
    - Функция аналитики с throttling
    - Использует throttle с интервалом 1000мс для вызова trackEvent
    - Группирует события одного типа за период throttling
    - Отправляет суммарную информацию: количество + последние детали---