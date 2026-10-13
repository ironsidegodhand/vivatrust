export const ADMIN_USER_IDS = new Set([
  'user_3Jpay4aZZD3rugS5ChAk4OchgnX',
  'user_3JpX7U6x7wpiVBPvoZuuxOWwvET',
]);

export const isAdmin = (userId: string | null) => Boolean(userId && ADMIN_USER_IDS.has(userId));
