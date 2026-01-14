import popupManager from '../../../components/warehouse/tools/PopupMessage';

// Main function to replace alert()
const showMessage = (message, type = 'info') => {
  // Handle different message formats
  if (typeof message === 'object' && message.message) {
    return popupManager.show(message.message, message.type || type);
  }
  
  // Auto-detect type based on message content if not specified
  if (type === 'info') {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('error') || lowerMessage.includes('failed') || lowerMessage.includes('invalid')) {
      type = 'error';
    } else if (lowerMessage.includes('warning') || lowerMessage.includes('already')) {
      type = 'warning';
    } else if (lowerMessage.includes('success') || lowerMessage.includes('saved') || lowerMessage.includes('loaded')) {
      type = 'success';
    }
  }
  
  return popupManager.show(message, type);
};

// Convenience methods
showMessage.info = (message) => popupManager.info(message);
showMessage.success = (message) => popupManager.success(message);
showMessage.error = (message) => popupManager.error(message);
showMessage.warning = (message) => popupManager.warning(message);

export default showMessage;
