/**
 * 404 Not Found Page
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@components/common'
import { ROUTES } from '@config/constants'
import './NotFoundPage.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <div className="not-found-page__content">
        <h1 className="not-found-page__title">404</h1>
        <p className="not-found-page__message">Page not found</p>
        <Button onClick={() => navigate(ROUTES.HOME)}>
          Go to Home
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
