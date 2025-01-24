import { useState, useEffect } from 'react';

export default function useFilterUsers(users) {
    const [filter, setFilter] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        if (!filter) {
            setFilteredUsers(users);
        } else {
            const lowercasedFilter = filter.toLowerCase();
            const filtered = users.filter(user => {
                const formattedLastLogin = user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString().toLowerCase()
                    : '';
                return (
                    user.name.toLowerCase().includes(lowercasedFilter) ||
                    user.email.toLowerCase().includes(lowercasedFilter) ||
                    formattedLastLogin.includes(lowercasedFilter)
                );
            });
            setFilteredUsers(filtered);
        }
    }, [filter, users]);

    return { filter, setFilter, filteredUsers };
}
