/**
 * Home Page
 * Landing page for the application
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@components/common'
import { ROUTES } from '@config/constants'
import './HomePage.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-page__hero">
        <h1 className="home-page__title">Welcome to FinxCollection</h1>
        <p className="home-page__description">
          Your comprehensive solution for financial collection management
        </p>
        <div className="home-page__actions">
          <Button onClick={() => navigate(ROUTES.LOGIN)} size="lg">
            Get Started
          </Button>
          <Button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            variant="outline"
            size="lg"
          >
            View Demo
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
