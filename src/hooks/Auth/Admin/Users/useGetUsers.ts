import { useState, useEffect } from 'react';
import { endpoints } from '../../../../store/api/endpoints';
import { getErrorMessage } from '../../../../service/apiUtils';
import axiosInstance from '../../../../service/axiosApi';

export interface User {
 role: string
  _id: string
  firstname: string
  lastname: string
  username: string
  fullName: string
  email: string
  password: string
  phone: string
}

const useGetUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get(endpoints.users.getAllUsers);
                const data = response.data
                setUsers(data.data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
};

export default useGetUsers;