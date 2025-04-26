import axios from "axios";
import { storeUser } from "./LocallyData";
import { SaveUser } from "@/Database/ChatQuery";
import { UserItem } from "@/types/ChatsType";

<<<<<<< HEAD
export const BACK_URL = `http://192.168.163.93:5000`;
=======
export const BACK_URL = `http://192.168.163.25:5000`;
>>>>>>> d1287a501afddf136136219ae40af179beda2aa8
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
        message: error?.response?.data?.message || "An error occurred during login",
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


export const sendFile = async (selectedFiles: any) => {
    const formData = new FormData();

    // Add each file to the formData
    selectedFiles.forEach(file => {
        formData.append('files', {
            uri: file.uri,
            name: file.fileName || 'file.jpg',
            type: file.mimeType || 'image/jpeg',
        });
    });

    try {
        const response = await axios.post(`${API_URL}/sendfile`, { // assuming '/upload' is your backend endpoint
            body: formData,
        });

        if (response.data.success && response.data.data) {
            return { success: true, message: "Status uploaded successfully", response: response.data.data };
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
}