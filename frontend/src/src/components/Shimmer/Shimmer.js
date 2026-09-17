import React from 'react';
import './Shimmer.css';

/**
 * Universal Shimmer Component
 * Wraps around any component and applies a shimmer effect to its text and content elements
 * when isLoading is true.
 *
 * Usage:
 * <Shimmer isLoading={loading}>
 *   <MyComponent />
 * </Shimmer>
 */
const Shimmer = ({ isLoading, children, className = '' }) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`universal-shimmer-wrapper ${className}`} aria-busy="true">
      {children}
    </div>
  );
};

export default Shimmer;
