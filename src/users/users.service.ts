import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { IUserService } from './interface/user-service.interface';
import { Role } from '@/config/types/roles.types';

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

  /**
   * Assign/Override user roles
   * Completely replaces the user's existing roles with the provided ones
   */
  async assignRoles(
    userId: string,
    assignRolesDto: AssignRolesDto,
  ): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user roles - overrides all existing roles
    await this.userRepo.update(
      { userId },
      {
        roles: assignRolesDto.roles,
      },
    );

    // Return updated user
    return await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  /**
   * Add roles to user (without removing existing ones)
   * Appends new roles to the user's existing roles
   */
  async addRoles(userId: string, rolesToAdd: Role[]): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Merge new roles with existing ones (remove duplicates)
    const updatedRoles = Array.from(new Set([...user.roles, ...rolesToAdd]));

    await this.userRepo.update(
      { userId },
      {
        roles: updatedRoles,
      },
    );

    return await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  /**
   * Remove specific roles from user
   */
  async removeRoles(
    userId: string,
    rolesToRemove: Role[],
  ): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove specified roles from user's roles
    const updatedRoles = user.roles.filter(
      (role) => !rolesToRemove.includes(role),
    );

    // Ensure user has at least one role
    if (updatedRoles.length === 0) {
      throw new UnauthorizedException(
        'User must have at least one role. Current roles: ' +
          user.roles.join(', '),
      );
    }

    await this.userRepo.update(
      { userId },
      {
        roles: updatedRoles,
      },
    );

    return await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.userRepo.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.roles;
  }
}
