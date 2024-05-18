import { CanActivate } from '@nestjs/common';

/**
 * Checks whether a route or a Controller is protected with the specified Guard.
 * @param route is the route or Controller to be checked for the Guard.
 * @param guardType is the type of the Guard, e.g. JwtAuthGuard.
 * @returns true if the specified Guard is applied.
 */

export function isGuarded(
  route: ((...args: any[]) => any) | (new (...args: any[]) => unknown),
  guardType: new (...args: any[]) => CanActivate,
): boolean {
  const guards: any[] = Reflect.getMetadata('__guards__', route);

  if (!guards) {
    throw Error(
      `Expected ${route.name} to be guarded by ${guardType.name}\nReceived: no guards found`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let foundGuard = false;
  const guardList: string[] = [];
  guards.forEach((guard) => {
    guardList.push(guard.name);
    if (guard.name === guardType.name) {
      foundGuard = true;
    }
  });

  if (!foundGuard) {
    throw Error(
      `Expected ${route.name} to be guarded by ${guardType.name}\nReceived: ${guardList}`,
    );
  }

  return true;
}
