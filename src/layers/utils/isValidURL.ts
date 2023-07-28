export const isValidURL = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[/\S*]*$/;
  return pattern.test(url);
};
