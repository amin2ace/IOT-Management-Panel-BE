// Relay Command (for controlling devices)
export const RelayCommandSchema = {
  type: 'object',
  required: ['state', 'timestamp'],
  properties: {
    state: {
      type: 'string',
      enum: ['ON', 'OFF'],
    },
    timestamp: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
