// CO2 Sensor (ppm)
export const CO2Schema = {
  type: 'object',
  required: ['value', 'timestamp'],
  properties: {
    value: {
      type: 'number',
      minimum: 0,
      maximum: 5000, // safe indoor limit usually up to 2000
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
