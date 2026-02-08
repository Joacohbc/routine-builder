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
    if (formatted.includes(':')) {
        // For times with minutes, keep the full format: "1:30m"
        return formatted + 'm';
    }
    // For times in seconds only: "30s"
    return formatted + 's';
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
