// Ammonia Sensor (ppm)
export const AmmoniaSchema = {
  type: 'object',
  required: ['value', 'timestamp'],
  properties: {
    value: {
      type: 'number',
      minimum: 0,
      maximum: 500, // safe indoor limits can vary
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
