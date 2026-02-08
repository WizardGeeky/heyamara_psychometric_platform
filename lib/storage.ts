import Redis from 'ioredis';

export interface UserData {
    email: string;
    responses: Record<string, number>;
    isCompleted: boolean;
    timestamp: string;
    scores?: any;
}

// Initialize Redis client
let redis: Redis | null = null;

function getRedisClient(): Redis {
    if (!redis) {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is not set');
        }

        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            // Enable TLS for Redis Cloud
            tls: redisUrl.includes('redislabs.com') || redisUrl.includes('cloud.redislabs') ? {
                rejectUnauthorized: false
            } : undefined
        });

        redis.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        redis.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });
    }

    return redis;
}

// Key prefix for Redis storage
const USER_KEY_PREFIX = 'user:';
const USER_LIST_KEY = 'users:all';

/**
 * Get user data by email from Redis
 */
export async function getUserByEmail(email: string): Promise<UserData | null> {
    try {
        const client = getRedisClient();
        const userKey = `${USER_KEY_PREFIX}${email.toLowerCase()}`;
        const data = await client.get(userKey);

        if (!data) return null;

        return JSON.parse(data) as UserData;
    } catch (error) {
        console.error('Error fetching user from Redis:', error);
        return null;
    }
}

/**
 * Save or update user data in Redis
 */
export async function saveUser(userData: UserData): Promise<void> {
    try {
        const client = getRedisClient();
        const userKey = `${USER_KEY_PREFIX}${userData.email.toLowerCase()}`;

        // Save user data with the email as key
        await client.set(userKey, JSON.stringify(userData));

        // Add email to the set of all users (for potential future listing)
        await client.sadd(USER_LIST_KEY, userData.email.toLowerCase());

        console.log(`✅ User data saved successfully for: ${userData.email}`);
    } catch (error) {
        console.error('❌ Error saving user to Redis:', error);
        throw new Error('Failed to save user data');
    }
}

/**
 * Get all users (optional - for admin purposes)
 */
export async function getAllUsers(): Promise<UserData[]> {
    try {
        const client = getRedisClient();
        const emails = await client.smembers(USER_LIST_KEY);

        if (!emails || emails.length === 0) return [];

        const users: UserData[] = [];
        for (const email of emails) {
            const userData = await getUserByEmail(email);
            if (userData) users.push(userData);
        }

        return users;
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
}

/**
 * Delete user data (optional - for GDPR compliance)
 */
export async function deleteUser(email: string): Promise<boolean> {
    try {
        const client = getRedisClient();
        const userKey = `${USER_KEY_PREFIX}${email.toLowerCase()}`;

        await client.del(userKey);
        await client.srem(USER_LIST_KEY, email.toLowerCase());

        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
