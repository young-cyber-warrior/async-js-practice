# JavaScript Async Mastery Course

## 🎯 О курсе

Практический курс по асинхронному программированию в JavaScript с задачами от простого к сложному. Курс основан на лучших практиках индустрии и включает 50+ задач с реальными сценариями использования.

## 🏆 Что вы изучите

- **Event Loop и Call Stack** - понимание основ асинхронности
- **Callbacks, Promises, async/await** - все способы работы с асинхронным кодом
- **Promise API** - Promise.all(), Promise.race(), Promise.allSettled(), Promise.any()
- **Обработка ошибок** - правильные паттерны для async кода
- **Throttling и Debouncing** - оптимизация производительности
- **Работа с API** - HTTP запросы, retry механизмы, кэширование
- **Real-world сценарии** - WebSockets, файлы, Service Workers

## 📚 Структура курса

### Модуль 1: Основы асинхронности
**Задачи 1-5** | Понимание Event Loop, callbacks, простые промисы

### Модуль 2: Promises в деталях  
**Задачи 6-12** | Promise API, обработка ошибок, создание собственных промисов

### Модуль 3: Async/Await
**Задачи 13-20** | Синтаксис async/await, параллельные vs последовательные операции

### Модуль 4: Продвинутые паттерны
**Задачи 21-30** | Throttling, debouncing, retry механизмы, timeout и AbortController

### Модуль 5: Работа с API и сетью
**Задачи 31-40** | Fetch API, кэширование, streaming, обработка HTTP ошибок

### Модуль 6: Реальные сценарии
**Задачи 41-50** | Загрузка файлов, WebSockets, Service Workers

---

## 📝 Задания по модулям

### 🎯 Задача 1: Понимание Event Loop

**Уровень:** Начальный  
**Тема:** Event Loop, Call Stack, Task Queue, Microtask Queue

**Условие:**
Проанализируйте следующий код и предскажите порядок выполнения:

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

**Требования:**
1. Напишите ожидаемый порядок вывода
2. Объясните работу Event Loop на этом примере
3. Объясните разницу между task queue и microtask queue

---

### 🎯 Задача 2: Callback Hell

**Уровень:** Начальный  
**Тема:** Callbacks, Promise chains, async/await

**Условие:**
Переписать callback hell в читаемый код используя Promises и async/await.

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

**Требования:**
1. Переписать используя Promises
2. Переписать используя async/await
3. Добавить правильную обработку ошибок

---

### 🎯 Задача 3: Promise.all vs Promise.race

**Уровень:** Начальный  
**Тема:** Promise API методы, параллельное выполнение

**Условие:**
Реализуйте 4 функции для работы с независимыми API сервисами:

```javascript
function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id, name: `User${id}`, role: 'user' });
        }, Math.random() * 1000 + 500);
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
        }, Math.random() * 800 + 200);
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
        }, Math.random() * 600 + 100);
    });
}

function fetchCurrency() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ USD: 75.5, EUR: 89.2 });
        }, Math.random() * 400 + 300);
    });
}
```

**Требования:**
1. `loadDashboard()` - Promise.all (все или ничего)
2. `loadFastest()` - Promise.race (первый результат)
3. `loadDashboardSafe()` - Promise.allSettled (все с отчетом об ошибках)
4. `loadAnySuccessful()` - Promise.any (первый успешный)

---

### 🎯 Задача 4: Обработка ошибок в Promise chains

**Уровень:** Средний  
**Тема:** Error handling, retry механизмы, fallback стратегии

**Условие:**
Реализуйте 4 функции с разными стратегиями обработки ошибок:

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

**Требования:**
1. `loadUserWithRetry(userId, maxRetries = 3)` - повторы при ошибках
2. `loadUserWithFallback(userId)` - fallback значения при ошибках
3. `loadUserSafelyWithLogging(userId)` - безопасная загрузка с логированием
4. `loadUserWithTimeout(userId, timeoutMs = 1000)` - таймаут для операций

---

### 🎯 Задача 5: Fetch API и обработка HTTP ошибок

**Уровень:** Средний  
**Тема:** HTTP статусы, headers, retry с exponential backoff

**Условие:**
Реализуйте функции для работы с реальным API:

```javascript
function simulateAPICall(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const random = Math.random();
            
            if (random < 0.1) {
                reject(new Error('Network Error: Connection failed'));
            } else if (random < 0.2) {
                resolve({
                    ok: false,
                    status: 404,
                    statusText: 'Not Found',
                    json: () => Promise.resolve({ error: 'User not found', code: 'USER_NOT_FOUND' })
                });
            } else if (random < 0.3) {
                resolve({
                    ok: false,
                    status: 401,
                    statusText: 'Unauthorized',
                    json: () => Promise.resolve({ error: 'Invalid token', code: 'INVALID_TOKEN' })
                });
            } else if (random < 0.4) {
                resolve({
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: () => Promise.resolve({ error: 'Database connection failed', code: 'DB_ERROR' })
                });
            } else if (random < 0.5) {
                resolve({
                    ok: false,
                    status: 429,
                    statusText: 'Too Many Requests',
                    headers: { get: (name) => name === 'Retry-After' ? '60' : null },
                    json: () => Promise.resolve({ error: 'Rate limit exceeded', retryAfter: 60 })
                });
            } else {
                resolve({
                    ok: true,
                    status: 200,
                    statusText: 'OK',
                    json: () => Promise.resolve({ 
                        id: 1, 
                        name: 'John Doe', 
                        email: 'john@example.com' 
                    })
                });
            }
        }, Math.random() * 1000 + 200);
    });
}
```

**Требования:**
1. `apiRequest(endpoint, options = {})` - универсальная функция для API запросов
2. `fetchUserWithRetry(userId, maxRetries = 3)` - retry только для recoverable ошибок
3. `fetchMultipleUsers(userIds, concurrency = 3)` - ограничение параллельности
4. `smartApiRequest(endpoint, options = {})` - умная обертка с exponential backoff

---

### 🎯 Задача 6: Throttling и Debouncing

**Уровень:** Средний  
**Тема:** Производительность, контроль частоты вызовов

**Условие:**
Реализуйте функции для оптимизации производительности:

```javascript
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

function updateUI(data) {
    console.log(`🎨 Обновление UI:`, data.length, 'элементов');
    return Promise.resolve();
}

function trackEvent(eventType, data) {
    console.log(`📊 Трек событие: ${eventType}`, data);
    return Promise.resolve();
}
```

**Требования:**
1. `debounce(func, delay)` - откладывает выполнение функции
2. `throttle(func, interval)` - ограничивает частоту вызовов
3. `smartSearch(query)` - умный поиск с debouncing и кэшированием
4. `trackUserActivity(activityType, details)` - аналитика с throttling

---

## 🛠️ Как использовать этот курс

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/username/js-async-mastery.git
cd js-async-mastery
```

### 2. Структура файлов
```
├── tasks/
│   ├── task-01-event-loop/
│   │   ├── README.md
│   │   ├── solution.js
│   │   └── tests.js
│   ├── task-02-callback-hell/
│   └── ...
├── solutions/
│   ├── task-01.js
│   ├── task-02.js
│   └── ...
└── README.md
```

### 3. Решайте задачи последовательно
1. Читайте условие в `tasks/task-XX/README.md`
2. Пишите решение в `tasks/task-XX/solution.js`
3. Запускайте тесты: `node tasks/task-XX/tests.js`
4. Сравните с эталонным решением в `solutions/`

### 4. Проверяйте понимание
- Объясните решение своими словами
- Попробуйте альтернативные подходы
- Подумайте о edge cases

## 📖 Дополнительные ресурсы

### Книги
- "You Don't Know JS: Async & Performance" - Kyle Simpson
- "JavaScript: The Definitive Guide" - David Flanagan
- "Effective JavaScript" - David Herman

### Онлайн материалы
- [JavaScript.info - Promises/async/await](https://javascript.info/async)
- [MDN - Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous)
- [Event Loop Visualizer](http://latentflip.com/loupe/)

### Практика
- [Codewars - Async Kata](https://www.codewars.com/)
- [LeetCode - Concurrency Problems](https://leetcode.com/problemset/concurrency/)
- [HackerRank - JavaScript Domain](https://www.hackerrank.com/domains/javascript)

## 🤝 Вклад в проект

Нашли ошибку или хотите добавить задачу? 
1. Создайте Issue
2. Сделайте Fork
3. Создайте Pull Request

## 📄 Лицензия

MIT License - используйте свободно для обучения и разработки.

## 🎯 О создателе

Этот курс создан на основе практического опыта и лучших практик индустрии. Все задачи проверены и протестированы.

---

**Happy Coding! 🚀**