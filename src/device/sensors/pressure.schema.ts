// Pressure Sensor (in hPa)
export const PressureSchema = {
  type: 'object',
  required: ['value', 'timestamp'],
  properties: {
    value: {
      type: 'number',
      minimum: 300, // typical min atmospheric pressure
      maximum: 1100, // typical max atmospheric pressure
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
