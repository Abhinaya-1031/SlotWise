import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, skipWhile, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait until the Firebase auth state has been initialized before checking if the user exists.
  // This avoids flashing to the login screen on page refresh.
  return authService.authInitialized$.pipe(
    skipWhile((initialized) => !initialized),
    take(1),
    map(() => {
      if (authService.currentUser) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
