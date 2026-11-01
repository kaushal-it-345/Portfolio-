import { lazy } from 'react';

/**
 * Wraps dynamic component import with a guaranteed minimum delay.
 * Prevents rapid UI flashes/flickering on high-speed connections.
 * 
 * @param {() => Promise<{ default: any }>} factory - Dynamic import function
 * @param {number} [minDelay=300] - Minimum delay in milliseconds
 * @returns {React.LazyExoticComponent<any>}
 */
export function lazyWithDelay(factory, minDelay = 300) {
    return lazy(() =>
        Promise.all([
            factory(),
            new Promise((resolve) => setTimeout(resolve, minDelay))
        ]).then(([moduleExports]) => moduleExports)
    );
}

export default lazyWithDelay;
