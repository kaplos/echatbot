

export const getStatusColor = (status) => {
    const [dontCare,color]= status.split(':');
    const colors = {
        grey: 'bg-gray-500 text-white',
        yellow: 'bg-yellow-500 text-white',
        green: 'bg-green-500 text-white',
        blue: 'bg-blue-500 text-white',
        red: 'bg-red-500 text-white',
    };
    return colors[color];
}