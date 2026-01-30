/**
 * ----------------------------------------------------------------------------
 * File: reportWebVitals.js
 * Authors:
 *      Amey Thakur
 *      GitHub: https://github.com/ameythakur
 *
 *      Mega Satish
 *      GitHub: https://github.com/msatmod
 *
 * Repository: https://github.com/Amey-Thakur/REACT-TODO-APP
 * License: MIT License
 * Release Date: June 25, 2022
 * ----------------------------------------------------------------------------
 *
 * File Overview:
 * This utility function measures the app's real-world performance using
 * Google's Web Vitals metrics (LCP, FID, CLS). These metrics help track
 * the user experience quality in production environments.
 *
 */

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry); // Cumulative Layout Shift
      getFID(onPerfEntry); // First Input Delay
      getFCP(onPerfEntry); // First Contentful Paint
      getLCP(onPerfEntry); // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

export default reportWebVitals;
