

export const getStatusColor = (status) => {
    const colors = {
        waiting_on_cads: 'bg-gray-500 text-white',
        working_on_it: 'bg-yellow-500 text-white',
        sample_created: 'bg-green-500 text-white',
        received_quote: 'bg-blue-500 text-white',
        dead: 'bg-red-500 text-white',
    };
    return colors[status];
}