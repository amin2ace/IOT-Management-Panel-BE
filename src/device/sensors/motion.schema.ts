// Motion Sensor (PIR)
export const MotionSchema = {
  type: 'object',
  required: ['detected', 'timestamp'],
  properties: {
    detected: {
      type: 'boolean',
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
