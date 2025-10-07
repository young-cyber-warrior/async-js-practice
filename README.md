JavaScript Async Programming Practice
🎯 О репозитории
Сборник практических задач по асинхронному программированию в JavaScript. 50 задач от базовых концепций до продвинутых real-world сценариев.
📚 Структура практики
📂 Модуль 1: Основы асинхронности
5 задач | module-1/README.md
Понимание Event Loop, callbacks, простейшие промисы

Задача 1: Event Loop и порядок выполнения
Задача 2: Переписывание callback hell
Задача 3: Promise API (all, race, allSettled, any)
Задача 4: Обработка ошибок в promise chains
Задача 5: Создание собственных Promise

📂 Модуль 2: Promises в деталях
7 задач | module-2/README.md
Глубокое изучение промисов и их возможностей

Задача 6: Promise.prototype.finally
Задача 7: Thenable объекты
Задача 8: Promise композиция и цепочки
Задача 9: Promise мемоизация
Задача 10: Обработка множественных promise chains
Задача 11: Кастомные Promise утилиты
Задача 12: Promise.withResolvers и продвинутые паттерны

📂 Модуль 3: Async/Await
8 задач | module-3/README.md
Современный синтаксис асинхронного программирования

Задача 13: Базовый async/await синтаксис
Задача 14: Параллельные vs последовательные операции
Задача 15: Обработка ошибок с try/catch
Задача 16: Async генераторы
Задача 17: For-await-of циклы
Задача 18: Async итераторы
Задача 19: Top-level await
Задача 20: Async функции высшего порядка

📂 Модуль 4: Продвинутые паттерны
10 задач | module-4/README.md
Throttling, debouncing, retry механизмы, контроль выполнения

Задача 21: Throttling и Debouncing
Задача 22: Retry механизмы с exponential backoff
Задача 23: Circuit Breaker паттерн
Задача 24: AbortController и отмена операций
Задача 25: Promise Queue с ограничением параллельности
Задача 26: Async Semaphore
Задача 27: Rate Limiter
Задача 28: Worker Pool паттерн
Задача 29: Lazy Promise выполнение
Задача 30: Promise кэширование и инвалидация

📂 Модуль 5: Работа с API и сетью
10 задач | module-5/README.md
HTTP запросы, streaming, WebSocket, кэширование

Задача 31: Fetch API и обработка HTTP ошибок
Задача 32: Автоматические retry для API запросов
Задача 33: Batch API requests и GraphQL батчинг
Задача 34: API Response кэширование
Задача 35: Request cancellation с AbortController
Задача 36: Streaming API responses
Задача 37: WebSocket connection management
Задача 38: Server-Sent Events обработка
Задача 39: File upload с прогрессом и resume
Задача 40: API rate limiting и quota management

📂 Модуль 6: Реальные сценарии
10 задач | module-6/README.md
Практические задачи из реальной разработки

Задача 41: Background sync с Service Worker
Задача 42: Real-time чат с WebSocket
Задача 43: Image lazy loading с intersection observer
Задача 44: Database transactions и connection pooling
Задача 45: Event sourcing паттерн
Задача 46: Микросервисы координация
Задача 47: Performance monitoring и metrics
Задача 48: Push notifications
Задача 49: Graceful shutdown
Задача 50: Full-stack async patterns