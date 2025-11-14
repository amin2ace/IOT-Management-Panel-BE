import { Injectable } from '@nestjs/common';
import Ajv from 'ajv';
import { SensorSchemaRegistry } from './sensors/sensor.schema.registry';
import { SensorType } from 'src/config/enum/sensor-type.enum';

@Injectable()
export class ValidationService {
  private ajv = new Ajv();

  validateSensorValue(type: SensorType, data: any) {
    const schema = SensorSchemaRegistry[type];
    if (!schema) return { valid: true, errors: null };

    const validate = this.ajv.compile(schema);
    const isValid = validate(data);

    return { valid: isValid, errors: validate.errors || null };
  }
}
