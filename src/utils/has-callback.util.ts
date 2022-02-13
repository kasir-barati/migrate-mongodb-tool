import { last } from 'lodash';
import fnArgs from 'fn-args';

export function hasCallback(
    func: (...args: any[]) => unknown,
) {
    const argNames = fnArgs(func);
    const lastArgName = last(argNames);

    if (!lastArgName) {
        return false;
    }

    return [
        'callback',
        'callback_',
        'cb',
        'cb_',
        'next',
        'next_',
        'done',
        'done_',
    ].includes(lastArgName);
}
