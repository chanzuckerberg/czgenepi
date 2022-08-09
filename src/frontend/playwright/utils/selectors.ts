export const getByTestID = (id: string): string => `[data-test-id="${id}"]`;
export const getByText = (text: string): string => `text=${text}`;
export const getByClassName = (className: string): string => `css=${className}`;