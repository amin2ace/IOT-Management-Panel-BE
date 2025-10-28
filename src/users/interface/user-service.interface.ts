import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserService {
  createUser(createUserDto: CreateUserDto): Promise<{ userId: string }>;
  findAllUsers();
  findUserById(userId: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<string>;
  deleteUser(userId: string): Promise<string>;
}
