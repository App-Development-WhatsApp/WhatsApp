import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto'; // Used to hash the URL safely

/**
 * Downloads a file from a remote URL only once and returns its local path.
 * The URL itself acts as the unique key.
 * @param remoteUri The remote URL of the file.
 * @returns Local file path.
 */
export const getCachedFilePathFromUrl = async (remoteUri: string): Promise<string> => {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, remoteUri);
    const extension = remoteUri.split('.').pop()?.split('?')[0] || 'bin';
    const localFileName = `${hash}.${extension}`;
    const localPath = `${FileSystem.cacheDirectory}${localFileName}`;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) return localPath;

    // Download and save to cache
    try {
        await FileSystem.downloadAsync(remoteUri, localPath);
        return localPath;
    } catch (error) {
        console.warn(`Failed to download file from ${remoteUri}`, error);
        throw error;
    }
};

/**
 * Deletes a cached file corresponding to a remote URL.
 * @param remoteUri The original remote URL used to cache the file.
 */
export const deleteCachedFileByUrl = async (remoteUri: string): Promise<void> => {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, remoteUri);
    const extension = remoteUri.split('.').pop()?.split('?')[0] || 'bin';
    const localFileName = `${hash}.${extension}`;
    const localPath = `${FileSystem.cacheDirectory}${localFileName}`;

    try {
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(localPath, { idempotent: true });
            console.log(`Deleted cached file: ${localPath}`);
        } else {
            console.log(`No cached file found to delete for: ${remoteUri}`);
        }
    } catch (error) {
        console.warn(`Failed to delete cached file for ${remoteUri}`, error);
    }
};
//   await deleteCachedFileByUrl('https://cloudinary.com/image123.jpg');
// const localPath = await getCachedFilePathFromUrl('https://cloudinary.com/image123.jpg');