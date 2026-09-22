export const ADMIN_USER_IDS = new Set([
  'user_3Jdv3d9fKd7gUbp5tADLNGSDmq0',
  'user_32aschArHPCFsRIVvCH5Ot2TuAw',
]);

export const isAdmin = (userId: string | null) => Boolean(userId && ADMIN_USER_IDS.has(userId));
