import React from 'react';
import { Spin } from 'antd';

interface PageLoaderProps {
    tip?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ tip = 'Đang tải...' }) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                width: '100%',
            }}
        >
            <Spin size="large" tip={tip}>
                <div style={{ padding: 50 }} />
            </Spin>
        </div>
    );
};

export default PageLoader;
