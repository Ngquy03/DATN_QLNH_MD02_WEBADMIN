import { useState, useCallback } from 'react';
import { message } from 'antd';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
}

export function useApi<T = any, P = any>(
    apiFunc: (params: P) => Promise<T>,
    options: UseApiOptions<T> = {}
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<T | null>(null);

    const execute = useCallback(
        async (params: P) => {
            setLoading(true);
            setError(null);

            try {
                const result = await apiFunc(params);
                setData(result);

                if (options.successMessage) {
                    message.success(options.successMessage);
                }

                if (options.onSuccess) {
                    options.onSuccess(result);
                }

                return result;
            } catch (err) {
                setError(err);

                if (options.errorMessage) {
                    message.error(options.errorMessage);
                }

                if (options.onError) {
                    options.onError(err);
                }

                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiFunc, options]
    );

    return {
        loading,
        error,
        data,
        execute,
    };
}
