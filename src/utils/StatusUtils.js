export const getStatusBgColor = (status) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-blue-500';
      case 'viewed':
        return 'bg-yellow-500';
      case 'paid':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'draft':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-purple-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  export default getStatusBgColor;