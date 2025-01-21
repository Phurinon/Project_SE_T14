import axios from 'axios';

const API = "http://localhost:3000/api";

// Get comments by shop ID
export const getShopComments = async (shopId) => {
    try {
        const response = await axios.get(`${API}/comments/shop/${shopId}`);
        return response.data;
    } catch (error) {
        throw handleCommentError(error);
    }
};

// Create new comment
export const createComment = async (token, commentData) => {
    try {
        // Validate comment data
        if (!commentData.content || !commentData.shopId) {
            throw new Error("Content are required");
        }

        const response = await axios.post(
            `${API}/comments`,
            commentData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleCommentError(error);
    }
};

// Update comment
export const updateComment = async (token, commentId, content) => {
    try {
        // Validate content
        if (!content || content.length === 0) {
            throw new Error("Content is required");
        }

        const response = await axios.put(
            `${API}/comments/${commentId}`,
            { content },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleCommentError(error);
    }
};

// Report comment
export const reportComment = async (token, commentId, reason) => {
    try {
        if (!reason || reason.length === 0) {
            throw new Error("Reason is required");
        }

        const response = await axios.post(
            `${API}/comments/${commentId}/report`,
            { reason },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleCommentError(error);
    }
};

// Delete comment
export const deleteComment = async (token, commentId) => {
    try {
        const response = await axios.delete(
            `${API}/comments/${commentId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw handleCommentError(error);
    }
};

const handleCommentError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
            case 400:
                if (data.errors) {
                    const errorMessages = data.errors.map(err => err.message).join(', ');
                    return new Error(`Validation error: ${errorMessages}`);
                }
                return new Error(data.message || "Invalid request");
            case 401:
                return new Error("You must be logged in");
            case 403:
                return new Error(data.message || "Not authorized");
            case 404:
                return new Error(data.message || "Comment or shop not found");
            case 500:
                return new Error("Server error - Please try again later");
            default:
                return new Error(data.message || "An unexpected error occurred");
        }
    }
    return error;
};