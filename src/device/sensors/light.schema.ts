// Light Sensor (Lux)
export const LightSchema = {
  type: 'object',
  required: ['value', 'timestamp'],
  properties: {
    value: {
      type: 'number',
      minimum: 0,
      maximum: 100000, // maximum sunlight intensity
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
