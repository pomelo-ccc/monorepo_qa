export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const isEmail = (email: string): boolean => {
  return email.includes('@');
};
