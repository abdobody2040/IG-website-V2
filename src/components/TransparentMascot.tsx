import { useEffect, useState } from 'react'

interface TransparentMascotProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  threshold?: number // RGB values above this threshold will be made transparent
}

export default function TransparentMascot({
  src,
  threshold = 248,
  className = '',
  alt = 'Instant Grow Mascot',
  ...props
}: TransparentMascotProps) {
  const [processedSrc, setProcessedSrc] = useState(src)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      // Process pixels: check for white/near-white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (r >= threshold && g >= threshold && b >= threshold) {
          data[i + 3] = 0 // set alpha to 0 (fully transparent)
        }
      }

      ctx.putImageData(imgData, 0, 0)
      try {
        setProcessedSrc(canvas.toDataURL())
      } catch (err) {
        console.warn('Canvas toDataURL failed (likely CORS on local dev), falling back to raw src', err)
        setProcessedSrc(src)
      }
    }
    img.onerror = () => {
      setProcessedSrc(src)
    }
  }, [src, threshold])

  return (
    <img
      src={processedSrc}
      className={className}
      alt={alt}
      {...props}
    />
  )
}
