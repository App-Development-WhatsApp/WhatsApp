const handleError = (error:any) => {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || "Server error occurred.",
        status: error.response.status,
        errors: error.response.data?.errors || [],
      };
    } else if (error.request) {
      return {
        success: false,
        message: "No response from the server. Please check your internet connection.",
        status: null,
      };
    } else {
      return {
        success: false,
        message: `Request error: ${error.message}`,
        status: null,
      };
    }
  };