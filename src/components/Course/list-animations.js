// list-animations.js

// Initialize all list animations
export function initializeListAnimations() {
    // Add ripple effect to material items
    addRippleEffect();
    
    // Setup section toggling
    setupSectionToggling();
  }
  
  // Clean up event listeners to prevent memory leaks
  export function cleanupListAnimations() {
    try {
      // Remove event listeners from material items
      document.querySelectorAll('.material-item').forEach(item => {
        const newItem = item.cloneNode(true);
        if (item.parentNode) {
          item.parentNode.replaceChild(newItem, item);
        }
      });
      
      // Remove event listeners from section headers
      document.querySelectorAll('.section-header').forEach(header => {
        const newHeader = header.cloneNode(true);
        if (header.parentNode) {
          header.parentNode.replaceChild(newHeader, header);
        }
      });
    } catch (error) {
      console.error("Error in cleanupListAnimations:", error);
    }
  }
  
  // Update progress indicators for items
  export function updateItemsProgress(progressData) {
    if (!progressData) return;
    
    const materialItems = document.querySelectorAll('.material-item');
    
    materialItems.forEach(item => {
      const itemId = item.getAttribute('data-id');
      if (itemId && progressData[itemId] !== undefined) {
        const progressIndicator = item.querySelector('.progress-indicator');
        if (progressIndicator) {
          progressIndicator.style.width = `${progressData[itemId]}%`;
        }
        
        // Mark as completed if progress is 100%
        if (progressData[itemId] >= 100) {
          item.classList.add('completed');
          
          // Add completion badge if it doesn't exist
          if (!item.querySelector('.completion-badge')) {
            const badge = document.createElement('span');
            badge.classList.add('completion-badge');
            badge.innerHTML = '✓';
            item.appendChild(badge);
          }
        }
      }
    });
  }
  
  // Add ripple effect to material items
  function addRippleEffect() {
    const materialItems = document.querySelectorAll('.material-item');
    
    materialItems.forEach(item => {
      item.addEventListener('click', function(e) {
        // Remove any existing ripples
        const existingRipples = this.querySelectorAll('.ripple');
        existingRipples.forEach(ripple => ripple.remove());
        
        // Create new ripple
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        // Position the ripple
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size/2}px`;
        ripple.style.top = `${e.clientY - rect.top - size/2}px`;
        
        // Remove ripple after animation completes
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
  
  // Setup section toggling
  function setupSectionToggling() {
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    sectionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        // Re-initialize ripple effect after DOM updates
        setTimeout(addRippleEffect, 100);
      });
    });
  }