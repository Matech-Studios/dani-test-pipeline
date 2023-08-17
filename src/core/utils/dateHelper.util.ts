export const transformTimestampToDate = (timestamp: number): Date => {
    return new Date(new Date(timestamp).toISOString().slice(0, 10));
};

export const fromMillisecondsToPoapDate = (timestamp: number): string => {
    const date = new Date(Number(timestamp));
    const offset = date.getTimezoneOffset();
    const offsetDate = new Date(date.getTime() - offset * 60 * 1000);
    return offsetDate.toISOString().split('T')[0];
};

export const addDays = (timestamp: number, days: number): number => {
    const dayInMilliseconds = 86400000;
    return Number(timestamp) + days * dayInMilliseconds;
};

export const getDateAtMidnight = (timestamp: number): number => {
    const date = new Date(Number(timestamp));
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

export const dateToStringYYYYMMDD = (date: Date): string => {
    return (
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
        ', ' +
        [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')
    );
};
