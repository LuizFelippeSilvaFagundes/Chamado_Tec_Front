import './LoadingSpinner.css'

interface SkeletonLoaderProps {
  type?: 'text' | 'title' | 'avatar' | 'card' | 'custom'
  width?: string
  height?: string
  count?: number
  className?: string
}

function SkeletonLoader({ 
  type = 'text', 
  width, 
  height, 
  count = 1,
  className = '' 
}: SkeletonLoaderProps) {
  const getSkeletonClass = () => {
    switch (type) {
      case 'title':
        return 'skeleton skeleton-title'
      case 'avatar':
        return 'skeleton skeleton-avatar'
      case 'card':
        return 'skeleton skeleton-card'
      case 'text':
        return 'skeleton skeleton-text'
      default:
        return 'skeleton'
    }
  }

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined
  }

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${getSkeletonClass()} ${className}`}
            style={style}
          />
        ))}
      </>
    )
  }

  return (
    <div
      className={`${getSkeletonClass()} ${className}`}
      style={style}
    />
  )
}

export default SkeletonLoader

