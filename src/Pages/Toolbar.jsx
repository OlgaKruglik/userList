import React from 'react'
import '../style/toolbar.css'
import blok from './image/blok2.png'
import unblok from './image/unblok.png'
import deleteUser from './image/delete.png'
import useFetchUsers from '../hoock/useUser';

export default function Toolbar() {
    const { users, loading, error: fetchError } = useFetchUsers();

    return (
        <div className='toolbar'>
            <div className='toolbar-header'>
                <div className='taking-actions'>
                    <div className='taking-image'>
                        <img src={blok} alt="blok" />
                        <p>BLOK</p>
                    </div>
                    <div className='taking-image header-image'>
                        <img src={unblok} alt='unblok' />
                    </div>
                    <div className='taking-image header-image'>
                        <img src={deleteUser} alt="deleteUser" />
                    </div>
                </div>
                <div className='toolbar-filter'>
                    <input type="email"
                        id="filter"
                        className="filter-input"
                        placeholder="Filter"/>
                </div>
            </div>
            <div className='foolbar-users'>
            {loading && <p>Loading users...</p>}
                {fetchError && <p>Error fetching users: {fetchError}</p>}
                {users && users.length > 0 ? (
                <ul>
                {users.map(user => (
                <li key={user.id}>
                <p>Email: {user.email}</p>
                <p>Password: {user.password}</p>
                </li>
                ))}
                </ul>
                ) : (
                !loading && <p>No users found.</p>
                )}
            </div>
        </div>
    )
}
