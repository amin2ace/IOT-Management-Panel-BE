import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * Returns a simple health message
   */
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns a simple health check message to verify the API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy and running',
    schema: {
      example: 'IoT Management Panel API is running!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * API status endpoint
   * Returns detailed status information
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get API status',
    description: 'Returns detailed information about the API status',
  })
  @ApiResponse({
    status: 200,
    description: 'API status information',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2025-11-14T12:00:00Z',
        uptime: 3600,
        version: '1.0.0',
      },
    },
  })
  getStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }
}
