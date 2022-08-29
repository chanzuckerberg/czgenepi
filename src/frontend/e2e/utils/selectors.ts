export const getByTestID = (id: string): string => `[data-test-id="${id}"]`;
export const getByText = (text: string): string => `text=${text}`;
export const getByClassName = (className: string): string => `css=${className}`;
export const getByID = (id: string): string => `[id="${id}"]`;
export const getByName = (name: string): string => `[name="${name}"]`;

export const SELECTORS = {
  USERNAME: "Input_Username",
  PASSWORD: "Input_Password",
  LOGIN_BTN: "Input.Button",
};
