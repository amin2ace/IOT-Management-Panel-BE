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
import { UserResponseDto, UserAuthResponseDto } from './dto/user-response.dto';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/config/decorator/roles.decorator';
import { Role } from '@/config/types/roles.types';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import { Serialize } from '@/common/decorator/serialize.decorator';

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
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.usersService.findAllUsers();
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
  findById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
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
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (SuperAdmin only)' })
  @ApiCookieAuth()
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch(':id/roles')
  @Serialize(UserResponseDto)
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
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  assignRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(userId, assignRolesDto);
  }

  /**
   * Get user roles (Admin+)
   * Returns the list of roles assigned to a specific user
   */
  @Get(':id/roles')
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
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  getUserRoles(@Param('id') userId: string) {
    return this.usersService.getUserRoles(userId);
  }

  /**
   * Add roles to user (SuperAdmin only)
   * Appends new roles to the user's existing roles without removing others
   */
  @Post(':id/roles/add')
  @Serialize(UserResponseDto)
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
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  addRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.usersService.addRoles(userId, assignRolesDto.roles);
  }

  /**
   * Remove roles from user (SuperAdmin only)
   * Removes specified roles from the user, ensuring at least one role remains
   */
  @Post(':id/roles/remove')
  @Serialize(UserResponseDto)
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
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove all roles - user must have at least one role',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  removeRoles(
    @Param('id') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.usersService.removeRoles(userId, assignRolesDto.roles);
  }
}
