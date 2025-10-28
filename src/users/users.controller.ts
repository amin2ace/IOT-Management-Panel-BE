import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('/get-all')
  findAll() {
    return this.usersService.findAllUsers();
  }

  @Get('get-user-by-id:id')
  findById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Get('get-user-by-email:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findUserByEmail(email);
  }

  @Patch('update-user:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete('delete-user:id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
