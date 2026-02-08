import { useState, useEffect } from 'react';
import { formatTime, parseTime } from '@/lib/timeUtils';

interface FormattedTimeInputProps {
    value: number;
    onChange: (val: number) => void;
    disabled?: boolean;
    className?: string;
}

function formatTimeWithSuffix(seconds: number) {
    const formatted = formatTime(seconds);
    const suffix = formatted.includes(':') ? 'm' : 's';
    const displayValue = formatted.replace(/:\d{2}$/, '') + suffix;
    return displayValue;
}

export function FormattedTimeInput({ value, onChange, disabled, className }: FormattedTimeInputProps) {
    const [localValue, setLocalValue] = useState(formatTimeWithSuffix(value ));

    useEffect(() => {
        setLocalValue(formatTimeWithSuffix(value));
    }, [value]);

    const handleBlur = () => {
        const seconds = parseTime(localValue);
        onChange(seconds);

        const displayValue = formatTimeWithSuffix(seconds);
        setLocalValue(displayValue);
    };

    return (
        <input
            className={className}
            placeholder="0s"
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
