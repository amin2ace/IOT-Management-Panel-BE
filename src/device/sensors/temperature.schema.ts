export const TemperatureSchema = {
  type: 'object',
  required: ['value', 'timestamp'],
  properties: {
    value: {
      type: 'number',
      minimum: -50,
      maximum: 100,
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
