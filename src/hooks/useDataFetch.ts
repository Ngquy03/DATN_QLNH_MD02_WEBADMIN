import { useState, useCallback } from 'react';

/**
 * Custom hook để quản lý việc fetch data với reload functionality
 * @param fetchFunction - Function để fetch data
 * @returns { data, loading, error, reload, setData }
 */
export function useDataFetch<T>(fetchFunction: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    const reload = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        reload,
        setData,
        fetchData
    };
}
