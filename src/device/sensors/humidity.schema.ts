export const HumiditySchema = {
  type: 'object',
  required: ['value', 'timestamp'],
  properties: {
    value: {
      type: 'number',
      minimum: 0,
      maximum: 100,
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
