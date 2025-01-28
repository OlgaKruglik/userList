import React, {  useState, useEffect} from 'react';
import '../style/toolbar.css'
import blok from './image/blok2.png'
import unblok from './image/unblok.png'
import deleteUser from './image/delete.png'
import useFetchUsers from '../hoock/useUser';
import useFilterUsers from '../hoock/useFilter';
import  arrow  from './image/round.png'

export default function Toolbar() {
    const { users, loading, error: fetchError, refetchUsers } = useFetchUsers();
    const { filter, setFilter, filteredUsers } = useFilterUsers(users);
    const [sortOrder, setSortOrder] = useState('asc');
    const [blockedUsers, setBlockedUsers] = useState(new Set());
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [blockedUsersList, setBlockedUsersList] = useState([]);

    const handleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    useEffect(() => {
        const blockedList = users.filter((user) => blockedUsers.has(user.id));
        setBlockedUsersList(blockedList);
    }, [blockedUsers, users]);

    useEffect(() => {
        if (users) {
            const blocked = new Set(users.filter((user) => user.is_blocked).map((user) => user.id));
            setBlockedUsers(blocked);
        }
    }, [users]);

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const dateA = a.last_login ? new Date(a.last_login) : new Date(0);
        const dateB = b.last_login ? new Date(b.last_login) : new Date(0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3033/api/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log(`User with ID ${userId} deleted successfully.`);
                window.location.reload();
            } else {
                console.error('Failed to delete user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleBlockSelected = async () => {
        try {
            const userIds = Array.from(selectedUsers);
            const response = await fetch('http://localhost:3033/api/users/block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds, isBlocked: true }),
            });
            if (response.ok) {
                setBlockedUsers((prevBlocked) => {
                    const newBlocked = new Set(prevBlocked);
                    userIds.forEach((id) => newBlocked.add(id));
                    return newBlocked;
                });
                setSelectedUsers(new Set());
            } else {
                console.error('Failed to block users');
            }
        } catch (error) {
            console.error('Error blocking users:', error);
        }
    };

    const handleUnblockSelected = async () => {
        try {
            const userIds = Array.from(selectedUsers);
            const response = await fetch('http://localhost:3033/api/users/block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds, isBlocked: false }),
            });
            if (response.ok) {
                setBlockedUsers((prevBlocked) => {
                    const newBlocked = new Set(prevBlocked);
                    userIds.forEach((id) => newBlocked.delete(id));
                    return newBlocked;
                });
                setSelectedUsers(new Set());
            } else {
                console.error('Failed to unblock users');
            }
        } catch (error) {
            console.error('Error unblocking users:', error);
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedUsers(new Set(sortedUsers.map((user) => user.id)));
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(userId)) {
                newSelected.delete(userId);
            } else {
                newSelected.add(userId);
            }
            return newSelected;
        });
    };

    const isAllSelected = sortedUsers.length > 0 && selectedUsers.size === sortedUsers.length;

    return (
        <div className='toolbar'>
        <div className='toolbar-header'>
            <div className='taking-actions'>
                <div className='taking-image' onClick={handleBlockSelected}>
                    <img src={blok} alt='blok' />
                    <p>BLOK</p>
                </div>
                <div className='taking-image header-image' onClick={handleUnblockSelected}>
                    <img src={unblok} alt='unblok' />
                </div>
                <div
                    className='taking-image header-image'
                    onClick={() =>
                        Array.from(selectedUsers).forEach((userId) => handleDeleteUser(userId))
                    }
                >
                    <img src={deleteUser} alt='deleteUser' />
                </div>
                <div className='taking-image' onClick={handleBlockSelected}>
                    <a href="/userList">Exit</a>
                </div>
            </div>
            <div className='toolbar-filter'>
                <input
                    type='text'
                    id='filter'
                    className='filter-input'
                    placeholder='Filter'
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>
        <div className='foolbar-users'>
            <div className='info-user table'>
                <div className='toolbar-header-table'>
                    <label>
                        <input
                            type='checkbox'
                            checked={isAllSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                    </label>
                    <p>Name</p>
                    <p>Email</p>
                    <div className='time-out'>
                            <img src={arrow} alt='arrow' onClick={handleSort} />
                            <p>Time</p>
                    </div>
                </div>
            </div>
            {loading && <p>Loading users...</p>}
            {fetchError && <p>Error fetching users: {fetchError}</p>}
            {sortedUsers && sortedUsers.length > 0 ? (
                <div className='list-users'>
                    {sortedUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`info-user  ${blockedUsers.has(user.id) ? 'blocked' : ''}`}
                        >
                            <label>
                                <input
                                    type='checkbox'
                                    checked={selectedUsers.has(user.id)}
                                    onChange={() => handleSelectUser(user.id)}
                                />
                            </label>
                            <p>{user.name === 'Default Name'
                                ? ''
                                : user.name}</p>
                                <p>{user.email}</p>
                                <p>
                                    {user.last_login
                                        ? new Date(user.last_login).toLocaleString()
                                        : '0'}
                                </p>
                        </div>
                    ))}
                </div>
            ) : (
                !loading && <p>No users found.</p>
            )}
        </div>
    </div>
);
}
