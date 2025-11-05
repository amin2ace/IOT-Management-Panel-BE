import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsSubnetMask(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSubnetMask',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const parts = value.split('.');
          if (parts.length !== 4) return false;

          const validOctets = [0, 128, 192, 224, 240, 248, 252, 254, 255];
          let previous = 255;

          for (const part of parts) {
            const num = parseInt(part, 10);
            if (!validOctets.includes(num)) return false;
            if (num > previous) return false; // subnet octets must decrease or stay same
            previous = num;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not a valid subnet mask`;
        },
      },
    });
  };
}
