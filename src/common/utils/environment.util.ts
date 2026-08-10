

export const isProductionEnvironment = (): boolean =>
  process.env.NODE_ENV?.toUpperCase() === 'PRODUCTION';

export const isDevelopmentEnvironment = (): boolean => {
  const env = process.env.NODE_ENV?.toLowerCase();
  return env === 'development' || env === 'dev';
}; 