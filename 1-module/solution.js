//  ============= 1
// 1 => 4 => 8 => 3 => 6 => 7 => 2 => 5

//  ============= 2

getUserData(1)
    .then((user) => {
        return getUserPosts(user.id).then((posts) => ({ user, posts }));
    })
    .then(({ user, posts }) => {
        return getPostComments(posts[0].id).then((comments) => ({
            user,
            posts,
            comments,
        }));
    })
    .then((result) => {
        console.log('Результат:', result);
    })
    .catch((err) => {
        console.error('Ошибка:', err);
    });

async function getData() {
    try {
        const userData = await getUserData(1);
        const userPost = await getUserPosts(userData.id);
        const userComment = await getPostComments(userPost.id);

        console.log('Результат:', { userData, userPost, userComment });
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

//  ============== 3

function loadAllUserData() {
    return Promise.all([
        fetchUser(1),
        fetchWeather('Moscow'),
        fetchNews(),
        fetchCurrency(),
    ]);
}

function loadUserDataSafe() {
    return Promise.allSettled([
        fetchUser(1),
        fetchWeather('Moscow'),
        fetchNews(),
        fetchCurrency(),
    ]);
}

loadUserDataSafe().then((results) => {
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`✅ Промис ${index}:`, result.value);
        } else {
            console.log(`❌ Промис ${index} упал:`, result.reason.message);
        }
    });
});

//  ============ 4

const defaultValues = {
    0: { id: 1, name: 'User 1', email: 'user1@example.com' },
    1: { userId: 1, theme: 'dark', notifications: true },
};

async function loadUserWithRetry(userId, maxRetries = 3) {
    let attempt = maxRetries;

    while (attempt >= 1) {
        try {
            return await fetchUserProfile(userId);
        } catch (error) {
            if (attempt === 1) {
                throw error;
            }
            --attempt;

            console.error(error);
        }
    }
}

async function loadUserWithFallback(userId) {
    const results = await Promise.allSettled([
        fetchUserProfile(userId),
        fetchUserSettings(userId),
    ]);

    const values = results.map((result, num) => {
        if (result.status == 'fulfilled') {
            return result.value;
        }
        if (result.status == 'rejected') {
            return defaultValues[num];
        }
    });

    return values;
}

async function loadUserSafelyWithLogging(userId) {
    const results = await Promise.allSettled([
        fetchUserProfile(userId),
        fetchUserSettings(userId),
        updateUserLastSeen(userId),
    ]);

    return results.reduce(
        (acc, result, num) => {
            if (result.status === 'fulfilled') {
                acc.data[num] = result.value;
            }

            if (result.status === 'rejected') {
                acc.errors.push(result.reason);
            }

            return acc;
        },
        { data: {}, errors: [] }
    );
}

//  ================ 5

async function apiRequest(endpoint, options = {}) {
    try {
        const request = await simulateAPICall(endpoint);
        const result = await request.json();

        if (request.ok) {
            return result;
        }

        const error = new Error(result.error || `HTTP ${request.status}`);
        error.status = request.status;
        error.code = result.code;
        if (request.status === 429) {
            error.retryAfter = request.headers?.get('Retry-After');
        }
        throw error;
    } catch (error) {
        if (error.status) {
            throw error;
        } else {
            const networkError = new Error(`Network error: ${error.message}`);
            networkError.isNetworkError = true;
            throw networkError;
        }
    }
}

async function fetchUserWithRetry(userId, maxRetries = 3) {
    try {
        return await apiRequest(userId);
    } catch (error) {
        if (maxRetries <= 0) {
            throw error;
        }

        if (error.status >= 500 || !error.status) {
            console.log(`${error.status} ${error.code} retries ${maxRetries}`);
            return await fetchUserWithRetry(userId, --maxRetries);
        }

        if (error.status === 429) {
            await new Promise((resolve) => setTimeout(resolve, 60));
            console.log(`${error.status} ${error.code} retries ${maxRetries}`);
            return await fetchUserWithRetry(userId, --maxRetries);
        }

        if (error.status >= 400 && error.status < 429) {
            console.log(`${error.status} ${error.code}`);
            throw error;
        }
    }
}

async function fetchMultipleUsers(userIds, concurrency = 3) {
    const results = { successful: [], failed: [] };

    for (let i = 0; i < userIds.length; i += concurrency) {
        const batch = userIds.slice(i, i + concurrency);

        const batchResults = await Promise.allSettled(
            batch.map((userId) => apiRequest(`/users/${userId}`))
        );

        batchResults.forEach((result, index) => {
            const userId = batch[index];

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

async function smartApiRequest(endpoint, attempt = 0) {
    try {
        console.log(`🚀 Попытка ${attempt + 1}/4 для ${endpoint}`);
        return await apiRequest(endpoint);
    } catch (error) {
        if (attempt >= 3) {
            throw error;
        }

        if (error.status >= 500 || !error.status || error.status === 429) {
            const delay =
                error?.retryAfter * 1000 ??
                Math.min(1000 * Math.pow(2, attempt), 30000);
            await new Promise((resolve) => setTimeout(resolve, delay));

            console.log(`${error.status} ${error.code} retries ${attempt}`);
            return await smartApiRequest(endpoint, ++attempt);
        }

        if (error.status >= 400 && error.status < 429) {
            console.log(`${error.status} ${error.code}`);
            throw error;
        }
    }
}
