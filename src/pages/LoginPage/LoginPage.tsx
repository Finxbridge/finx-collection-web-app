/**
 * Login Page
 * Page component for user login
 */

import { LoginForm } from '@components/features'
import { AuthLayout } from '@layouts'

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage
