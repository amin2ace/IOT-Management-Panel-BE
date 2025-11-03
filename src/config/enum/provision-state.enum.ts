export enum ProvisionState {
  DISCOVERED = 'discovered', // received capabilities but not assigned
  UNASSIGEND = 'unassigned', // was assigned but now unassigned
  ASSIGNED = 'assigned', // assigned a type, config sent
  ACTIVE = 'active', // sending valid data
  ERROR = 'error', // data invalid or offline
}
