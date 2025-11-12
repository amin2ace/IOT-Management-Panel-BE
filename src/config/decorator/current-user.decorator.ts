import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // request.user should be populated by your AuthGuard (e.g., JWT)
    const user = request.user;

    if (!user) return null;

    // If a specific property is requested
    return data ? user[data] : user;
  },
);
