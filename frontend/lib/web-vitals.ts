/**
 * Performance monitoring configuration for Core Web Vitals
 */

export function reportWebVitals(metric: any) {
  // Log all metrics to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Core Web Vitals:', metric)
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // You can send to your preferred analytics service
    // Example: gtag, Vercel Analytics, etc.
    
    switch (metric.name) {
      case 'FCP':
        console.log('First Contentful Paint:', metric.value)
        break
      case 'LCP':
        console.log('Largest Contentful Paint:', metric.value)
        break
      case 'CLS':
        console.log('Cumulative Layout Shift:', metric.value)
        break
      case 'FID':
        console.log('First Input Delay:', metric.value)
        break
      case 'TTFB':
        console.log('Time to First Byte:', metric.value)
        break
      case 'INP':
        console.log('Interaction to Next Paint:', metric.value)
        break
    }
  }
}

// Performance tips for optimization
export const performanceTips = {
  // LCP optimization
  optimizeLCP: [
    'Preload critical images',
    'Optimize server response times',
    'Use efficient image formats (WebP, AVIF)',
    'Implement proper caching',
    'Minimize render-blocking resources'
  ],
  
  // CLS optimization
  optimizeCLS: [
    'Set explicit dimensions for images and videos',
    'Reserve space for dynamic content',
    'Avoid inserting content above existing content',
    'Use transform animations instead of changing layout properties'
  ],
  
  // FID/INP optimization
  optimizeFID: [
    'Minimize JavaScript execution time',
    'Split long tasks',
    'Use code splitting and lazy loading',
    'Optimize third-party code',
    'Use a web worker for heavy computations'
  ]
}