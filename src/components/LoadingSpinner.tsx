import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  fullScreen?: boolean
}

function LoadingSpinner({ size = 'medium', message, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClass = `spinner-${size}`
  
  const spinner = (
    <div className="loading-spinner-container">
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner

