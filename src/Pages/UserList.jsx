import React, { useEffect } from 'react';
import '../style/login.css';
import { useNavigate } from 'react-router-dom';

function UserList() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/');
        }, [navigate]);
    return (
        <div>
        </div>
    )
}

export default UserList
