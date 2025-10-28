import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Token } from './token.entity';
import { Blacklist } from './blacklist.entity';

const entitiesIndex: EntityClassOrSchema[] = [Token, Blacklist];

export default entitiesIndex;
