let config = null;
let isRealData = false;
const LOAD_DATA = false;

if (LOAD_DATA) {
    try {
        console.log('🔄 Попытка загрузить данные...');

        const response = await fetch(
            'https://jsonplaceholder.typicode.com/posts'
        );

        if (!response.ok) {
            throw new Error(`HTTP ошибка! Статус: ${response.status}`);
        }

        config = await response.json();
        isRealData = true;
        console.log('✅ Данные загружены успешно!');
        console.log(`📊 Загружено ${config.length} постов`);
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error.message);
        console.warn('⚠️ Использую fallback данные');
        config = [
            {
                id: 0,
                title: 'Fallback пост 1',
                body: 'Это данные по умолчанию',
                fallback: true,
            },
            {
                id: 1,
                title: 'Fallback пост 2',
                body: 'Ошибка при загрузке',
                fallback: true,
            },
        ];
        isRealData = false;
    }

    // ✅ Финальная информация
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
        `📌 Источник данных: ${
            isRealData ? 'РЕАЛЬНЫЕ данные ✅' : 'FALLBACK данные ⚠️'
        }`
    );
    console.log(`📌 Всего элементов: ${config.length}`);
} else {
    console.log(`📌 Данные не загружались, так как: ${LOAD_DATA}`);
    config = [];
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

export { config, isRealData };
