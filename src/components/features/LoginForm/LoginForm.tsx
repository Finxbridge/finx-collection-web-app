/**
 * Login Form Component
 * Feature-specific component for user login
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks'
import { Button, Input } from '@components/common'
import { ROUTES } from '@config/constants'
import './LoginForm.css'

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      await login(email, password)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2 className="login-form__title">Welcome Back</h2>

      {error && <div className="login-form__error">{error}</div>}

      <Input
        type="email"
        label="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />

      <Input
        type="password"
        label="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      <Button type="submit" isLoading={isLoading} className="login-form__submit">
        Sign In
      </Button>

      <p className="login-form__footer">
        Don't have an account?{' '}
        <a href={ROUTES.REGISTER} className="login-form__link">
          Sign up
        </a>
      </p>
    </form>
  )
}

export default LoginForm
