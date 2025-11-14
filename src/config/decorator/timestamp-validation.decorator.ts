// validators/is-valid-timestamp.decorator.ts
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// TODO: Device clock i strill allowed time drift
export function IsValidTimestampMillis(
  maxAgeMs = 5 * 60 * 1000, // 5 minutes allowed age
  futureDriftMs = 60 * 1000, // 1 minute ahead allowed
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidTimestampMillis',
      target: object.constructor,
      propertyName,
      constraints: [maxAgeMs, futureDriftMs],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'number') return false;

          const [maxAge, futureDrift] = args.constraints;
          const now = Date.now();

          return value > now - maxAge && value <= now + futureDrift;
        },
        defaultMessage() {
          return 'Timestamp must be a recent valid local epoch milliseconds value';
        },
      },
    });
  };
}
