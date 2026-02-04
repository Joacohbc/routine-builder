import { useState, useEffect } from 'react';
import { formatTime, parseTime } from '@/lib/timeUtils';

interface FormattedTimeInputProps {
    value: number | undefined;
    onChange: (val: number) => void;
    disabled?: boolean;
    className?: string;
}

export function FormattedTimeInput({ value, onChange, disabled, className }: FormattedTimeInputProps) {
    const [localValue, setLocalValue] = useState(formatTime(value));

    useEffect(() => {
        setLocalValue(formatTime(value));
    }, [value]);

    const handleBlur = () => {
        const seconds = parseTime(localValue);
        onChange(seconds);
        setLocalValue(formatTime(seconds));
    };

    return (
        <input
            className={className}
            placeholder="-"
            type="text"
            disabled={disabled}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.currentTarget.blur();
                }
            }}
        />
    );
}
