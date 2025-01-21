import axios from 'axios';

const API = "http://localhost:3000/api";

// Get all safety levels
export const getAllSafetyLevels = async () => {
    try {
        const response = await axios.get(`${API}/safety-levels`);
        return response.data;
    } catch (error) {
        throw handleSafetyLevelError(error);
    }
};

// Create safety level (admin only)
export const createSafetyLevel = async (token, safetyLevelData) => {
    try {
        const { label, maxValue, color, description, shopId } = safetyLevelData;

        // Validate required fields
        if (!label || !maxValue || !color || !description || !shopId) {
            throw new Error("All fields are required: label, maxValue, color, description, shopId");
        }

        // Validate maxValue is a positive number
        if (typeof maxValue !== 'number' || maxValue <= 0) {
            throw new Error("maxValue must be a positive number");
        }

        // Validate color format (hex color)
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(color)) {
            throw new Error("color must be a valid hex color code (e.g., #FF0000)");
        }

        const response = await axios.post(
            `${API}/safety-levels`,
            safetyLevelData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleSafetyLevelError(error);
    }
};

// Update safety level (admin only)
export const updateSafetyLevel = async (token, levelId, updateData) => {
    try {
        // Validate maxValue if provided
        if (updateData.maxValue && (typeof updateData.maxValue !== 'number' || updateData.maxValue <= 0)) {
            throw new Error("maxValue must be a positive number");
        }

        // Validate color if provided
        if (updateData.color) {
            const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!colorRegex.test(updateData.color)) {
                throw new Error("color must be a valid hex color code (e.g., #FF0000)");
            }
        }

        const response = await axios.put(
            `${API}/safety-levels/${levelId}`,
            updateData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleSafetyLevelError(error);
    }
};

// Delete safety level (admin only)
export const deleteSafetyLevel = async (token, levelId) => {
    try {
        const response = await axios.delete(
            `${API}/safety-levels/${levelId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleSafetyLevelError(error);
    }
};

// Helper function to handle errors
const handleSafetyLevelError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
            case 400:
                return new Error(data.message || "Invalid request data");
            case 401:
                return new Error("Unauthorized - Please login as admin");
            case 403:
                return new Error("Forbidden - Admin access required");
            case 404:
                return new Error("Safety level not found");
            case 500:
                return new Error("Server error - Please try again later");
            default:
                return new Error(data.message || "An unexpected error occurred");
        }
    }
    return error;
};

// Utility functions for working with safety levels
export const getSafetyLevelColor = (value, safetyLevels) => {
    const level = safetyLevels
        .sort((a, b) => a.maxValue - b.maxValue)
        .find(level => value <= level.maxValue);
    return level ? level.color : '#808080'; // Default gray if no matching level
};

export const getSafetyLevelLabel = (value, safetyLevels) => {
    const level = safetyLevels
        .sort((a, b) => a.maxValue - b.maxValue)
        .find(level => value <= level.maxValue);
    return level ? level.label : 'Unknown';
};