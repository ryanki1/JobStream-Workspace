import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticateService } from '@jobstream-workspace/shared-ui';

export const authGuard = () => {
  const auth = inject(AuthenticateService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
