import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';
import { Role } from '@/config/types/roles.types';

export interface IUserService {
  createUser(createUserDto: CreateUserDto): Promise<{ userId: string }>;
  findAllUsers();
  findUserById(userId: string): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(userId: string): Promise<string>;
  assignRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<User>;
  addRoles(userId: string, rolesToAdd: Role[]): Promise<User>;
  removeRoles(userId: string, rolesToRemove: Role[]): Promise<User>;
  getUserRoles(userId: string): Promise<User>;
}
