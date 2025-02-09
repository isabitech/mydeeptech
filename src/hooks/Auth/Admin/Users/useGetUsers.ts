import { useState, useEffect } from 'react';
import { endpoints } from '../../../../store/api/endpoints';

export interface User {
    role: string
  _id: string
  firstname: string
  lastname: string
  username: string
  email: string
  password: string
  phone: string
  __v: number
}

const useGetUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(endpoints.users.getAllUsers);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUsers(data.data);
                console.log(data.data)
            } catch (err:any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
};

export default useGetUsers;