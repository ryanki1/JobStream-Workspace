# Shared UI Library

This library contains shared UI components and services that can be used across multiple applications in the JobStream workspace.

## Components

### LoginComponent

A reusable login component that can be used for both admin and candidate authentication.

**Usage:**
```typescript
import { LoginComponent } from '@jobstream-workspace/shared/ui';

// In your routes
{
  path: 'login',
  component: LoginComponent,
  title: 'Login'
}
```

## Services

### AuthenticateService

A service for handling authentication state.

**Usage:**
```typescript
import { AuthenticateService } from '@jobstream-workspace/shared/ui';

// In your component
const auth = inject(AuthenticateService);
if (auth.isAuthenticated()) {
  // User is authenticated
}
```

## Import Path

All exports from this library are available at:
```typescript
import { LoginComponent, AuthenticateService } from '@jobstream-workspace/shared/ui';
```
