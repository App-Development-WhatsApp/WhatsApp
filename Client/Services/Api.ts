import axios from "axios";
import { storeUser } from "./LocallyData";
import { SaveUser } from "@/Database/ChatQuery";
import { UserItem } from "@/types/ChatsType";

export const BACK_URL = `http://10.10.15.92:5000`;
export const API_URL = `${BACK_URL}/api/v1/users`;

export const login = async (username: string, phoneNumber: string, file: string | null) => {
    const formData = new FormData();

    formData.append("username", username);
    formData.append("phoneNumber", phoneNumber);

    if (file) {
        const filename = file.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image`;

        formData.append("file", {
            uri: file,
            name: filename,
            type: fileType,
        } as any);
    }

    try {
        const response = await axios.post(`${API_URL}/login`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });

        console.log(response.data, "response");

        if (response.data.success && response.data.data?.user) {
            storeUser(response.data.data.user)
            return { success: true, user: response.data.data.user };
        } else {
            return {
                success: false,
                message: response.data.message || "Login failed",
            };
        }
    } catch (error: any) {
        return handleError(error);
    }
};

const handleError = (error: any) => {
    console.error("Error:", error?.response?.data || error.message || error);
    return {
        success: false,
        message: error?.response?.data?.message || "Server No response",
        users: [],
        user: null
    };
};

export const getAllUsersFromDatabase = async () => {
    try {
        const response = await axios.get(`${API_URL}/getAllUsers`);
        // console.log(response.data, "response");

        if (response.data.success && response.data.data) {
            return { success: true, users: response.data.data, message: response.data.message || "All users fetched successfully", };
        } else {
            return {
                success: false,
                users: [],
                message: response.data.message || "All users fetched successfully",
            };
        }
    } catch (error: any) {
        return handleError(error);
    }
}

export const getUserById = async (id: string) => {
    try {
        const response = await axios.post(`${API_URL}/getUserById/${id}`);
        if (response.data.success && response.data.data) {
            const user: UserItem = {
                id: response.data.data.user._id,
                jid: response.data.data.user._id,
                name: response.data.data.user.username,
                image: response.data.data.user.image,
                phone: response.data.data.user.phoneNumber,
            }
            SaveUser(user)
            return {
                success: true,
                user: response.data.data,
                message: response.data.message || "User fetched successfully",
            };
        } else {
            return {
                success: false,
                user: null,
                message: response.data.message || "Failed to fetch user",
            };
        }
    } catch (error: any) {
        return handleError(error);
    }
};


export const sendFile = async (selectedFiles: { uri: string; fileName?: string }[]) => {
    const formData = new FormData();

    // Helper function to derive MIME type from file extension
    const getMimeType = (uri: string) => {
        const extension = uri.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'pdf':
                return 'application/pdf';
            case 'mp4':
                return 'video/mp4';
            case 'mp3':
                return 'audio/mpeg';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'ppt':
                return 'application/vnd.ms-powerpoint';
            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            case 'xls':
                return 'application/vnd.ms-excel';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            default:
                return 'application/octet-stream'; // fallback generic type
        }
    };

    // Add each file to the formData
    selectedFiles.forEach(file => {
        formData.append('files', {
            uri: file.uri,
            name: file.fileName || file.uri.split('/').pop() || 'file',
            type: getMimeType(file.uri),
        } as any); // 'as any' needed if using React Native or strict TS
    });

    try {
        const response = await axios.post(`${API_URL}/sendfile`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (response.data.success &&  response.data.data.data) {
            return { success: true, message: "Files uploaded successfully", response: response.data.data.data };
        } else {
            return {
                success: false,
                response: [],
                message: response.data.message || "Failed to upload files",
            };
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
};

export const deleteFiles = async (selectedFiles: { uri: string }[]) => {
    try {
      const uris = selectedFiles.map(file => file.uri);
  
      const response = await axios.post(`${API_URL}/deletefile`, { uris });
  
      if (response.data.success && response.data.data) {
        return {
          success: true,
          message: "Files deleted successfully",
          response: response.data.data,
        };
      } else {
        return {
          success: false,
          response: [],
          message: response.data.message || "Failed to delete files",
        };
      }
    } catch (error) {
      console.error("Error deleting files:", error);
      return null;
    }
  };
  
export const Upload_Status = async (formData: FormData) => {
    try {
      const response = await axios.post(`${API_URL}/uploadStatus`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data)
  
      if (response.data.files && response.data.success) {
        return {
          success: true,
          message: "Status uploaded successfully",
          response: response.data.files,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to upload status",
          response: null,
        };
      }
    } catch (error: any) {
      console.error("Error uploading status:", error);
      handleError(error);
      return {
        success: false,
        message: error.message || "Unexpected error",
        response: null,
      };
    }
  };
  
export const Get_Statuses = async (userIds: string[]) => {
    try {
      const response = await axios.post(`${API_URL}/status/get`, { userIds });
      if (response.data.success && response.data.statuses) {
        return {
          success: true,
          message: "Statuses fetched successfully",
          statuses: response.data.statuses,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to fetch statuses",
          statuses: [],
        };
      }
    } catch (error: any) {
      console.error("Error fetching statuses:", error);
      handleError(error);
      return {
        success: false,
        message: error.message || "Unexpected error",
        statuses: [],
      };
    }
  };