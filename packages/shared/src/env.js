export const getEnv = (name, fallback) => {
    const val = process.env[name] ?? fallback;
    if (val === undefined)
        throw new Error(`Missing env var: ${name}`);
    return val;
};
