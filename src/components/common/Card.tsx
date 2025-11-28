import React from 'react';
import { Card as AntCard } from 'antd';
import type { CardProps } from 'antd';

interface CustomCardProps extends CardProps {
    children: React.ReactNode;
}

const Card: React.FC<CustomCardProps> = ({ children, ...props }) => {
    return (
        <AntCard
            variant="borderless"
            style={{
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                ...props.style,
            }}
            {...props}
        >
            {children}
        </AntCard>
    );
};

export default Card;
