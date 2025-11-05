import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidEpochMillis(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidEpochMillis',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'number') return false;
          const now = Date.now();
          return value >= 0 && value <= now + 60000; // allow slight future drift
        },
        defaultMessage() {
          return 'Invalid epoch uptime';
        },
      },
    });
  };
}
