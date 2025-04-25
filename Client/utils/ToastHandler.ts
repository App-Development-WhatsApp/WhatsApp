import { Toast } from 'toastify-react-native';

// Utility function to show toast with slide-in and slide-out animations
const showToast = (type: 'success' | 'error' | 'info', position: 'top' | 'bottom', text1: string, text2: string) => {
  let positionValue = position === 'top' ? -100 : 100; // Start from above or below the screen

  Toast.show({
    type: type,
    position: position,
    text1: text1,
    text2: text2,
    visibilityTime: 3000, // Default visibility time of 3 seconds
    animationType: 'fade', // Toast animation type
    style: {
      height: 50, // Adjust the height of the toast (smaller height)
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10, // Optional: rounded corners
      paddingHorizontal: 20, // Optional: horizontal padding
      transform: [{ translateY: positionValue }], // Initial position off-screen (either top or bottom)
      transition: 'transform 0.5s ease-in-out', // Slide animation for moving toast in and out
    },
    contentStyle: {
      opacity: 0, // Start with no opacity for fade-in effect
      transform: [{ scale: 0.5 }], // Start with smaller size for scale effect
      transition: 'opacity 0.5s, transform 0.5s', // Animation for opacity and scale
    },
    onShow: () => {
      // Animate to bring the toast into the view
      setTimeout(() => {
        Toast.show({
          type: type,
          position: position,
          text1: text1,
          text2: text2,
          visibilityTime: 3000,
          animationType: 'fade',
          style: {
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            paddingHorizontal: 20,
            transform: [{ translateY: 0 }], // Slide into view
          },
          contentStyle: {
            opacity: 1, // Fade-in to full opacity
            transform: [{ scale: 1 }], // Scale to normal size
          },
        });
      }, 100); // Slide-in after a slight delay
    },
    onHide: () => {
      // Slide the toast out of view after visibilityTime (3000ms)
      setTimeout(() => {
        Toast.show({
          type: type,
          position: position,
          text1: text1,
          text2: text2,
          visibilityTime: 0, // Make sure it's hidden immediately after slide-out
          animationType: 'fade',
          style: {
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            paddingHorizontal: 20,
            transform: [{ translateY: position === 'top' ? -100 : 100 }], // Slide out of view
          },
          contentStyle: {
            opacity: 0, // Fade out the toast
            transform: [{ scale: 0.5 }], // Shrink the toast as it leaves
          },
        });
      }, 3000); // Hide the toast after it has been visible for the full duration
    },
  });
};

export default showToast;
