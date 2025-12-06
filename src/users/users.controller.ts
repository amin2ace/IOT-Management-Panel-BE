import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/config/decorator/roles.decorator';
import { Role } from '@/config/types/roles.types';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import { Serialize } from '@/common/decorator/serialize.decorator';
import type { Request, Response } from 'express';
import { RolesResponseDto } from './dto/roles-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Serialize(UserResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUserManually(createUserDto);
  }

  @Get()
  @Serialize(UserResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll() {
    return await this.usersService.findAllUsers();
  }

  @Get(':id')
  @Serialize(UserResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string) {
    return await this.usersService.findUserById(id);
  }

  @Get('profile')
  // @Serialize(UserResponseDto)
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile',
    // type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Req() req: Request) {
    const userId = req['user'];
    console.log({ req });
    return await this.usersService.findUserById(userId);
  }

  @Patch('profile')
  @Serialize(UserResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.ENGINEER, Role.TEST, Role.VIEWER)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserProfile(
    @Body() userData: UpdateUserDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.userId;
    return await this.usersService.updateUser(userId, userData);
  }

  @Patch(':id')
  @Serialize(UserResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user details' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (SuperAdmin only)' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async remove(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }

  @Patch(':id/roles')
  @Serialize(RolesResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Assign/Override user roles (SuperAdmin only)',
    description:
      "Completely replaces the user's existing roles with the provided ones. Useful for role reassignment.",
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'User roles updated successfully',
    type: RolesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async assignRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const user = await this.usersService.assignRoles(userId, assignRolesDto);

    return plainToInstance(RolesResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get user roles (Admin+)
   * Returns the list of roles assigned to a specific user
   */
  @Get(':id/roles')
  @Serialize(RolesResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get user roles (Admin only)',
    description: 'Returns the list of roles assigned to a specific user',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    schema: {
      example: {
        userId: 'uuid-123',
        roles: ['viewer', 'engineer'],
      },
    },
    type: RolesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getUserRoles(@Param('id') userId: string) {
    const result = await this.usersService.getUserRoles(userId);
    return plainToInstance(RolesResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Add roles to user (SuperAdmin only)
   * Appends new roles to the user's existing roles without removing others
   */
  @Post(':id/roles/add')
  @Serialize(RolesResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Add roles to user (SuperAdmin only)',
    description:
      "Appends new roles to the user's existing roles without removing others. Duplicates are automatically handled.",
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 201,
    description: 'Roles added successfully',
    type: RolesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async addRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const result = await this.usersService.addRoles(
      userId,
      assignRolesDto.roles,
    );
    return plainToInstance(RolesResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Remove roles from user (SuperAdmin only)
   * Removes specified roles from the user, ensuring at least one role remains
   */
  @Post(':id/roles/remove')
  @Serialize(RolesResponseDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Remove roles from user (SuperAdmin only)',
    description:
      'Removes specified roles from the user. User must retain at least one role.',
  })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Roles removed successfully',
    type: RolesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove all roles - user must have at least one role',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const result = await this.usersService.removeRoles(
      userId,
      assignRolesDto.roles,
    );
    return plainToInstance(RolesResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
