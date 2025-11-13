import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { IUserService } from './interface/user-service.interface';

@Injectable()
export class UsersService implements IUserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<{ userId: string }> {
    const { ...userData } = createUserDto;

    const user = await this.findUserByEmail(userData.email);

    if (user) {
      throw new UnauthorizedException('Email in Use');
    }

    // Create a new user record with the hashed data
    const userRecord = this.userRepo.create({
      ...userData,
      isActive: true,
    });

    // Save the provided user record to the database
    await this.userRepo.save(userRecord);

    // Return a success message
    return { userId: userRecord.userId };
  }

  async findAllUsers() {
    return await this.userRepo.find();
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // Check if a user with the provided email exists in the database
    const user = await this.userRepo.findOne({
      where: {
        email,
        isActive: true,
      },
    });

    // Return the user if user exists
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<string> {
    const user = this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    await this.userRepo.update({ userId }, updateUserDto);
    return `User with id ${userId} successfully updated`;
  }

  async deleteUser(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.update(
      { userId },
      {
        isActive: false,
      },
    );

    return `User with id ${userId} was successfully deleted`;
  }
}
