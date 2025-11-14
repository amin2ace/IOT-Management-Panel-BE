// GPS Location (Latitude & Longitude)
export const GPSSchema = {
  type: 'object',
  required: ['latitude', 'longitude', 'timestamp'],
  properties: {
    latitude: {
      type: 'number',
      minimum: -90,
      maximum: 90,
    },
    longitude: {
      type: 'number',
      minimum: -180,
      maximum: 180,
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
