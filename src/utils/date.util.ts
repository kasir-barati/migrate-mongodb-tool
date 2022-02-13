import { format } from 'date-fns';

export function now(dateString = Date.now()) {
    const date = new Date(dateString);
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds(),
    );
}

export function nowAsString() {
    return format(now(), 'yyyyMMddHHmmss');
}
