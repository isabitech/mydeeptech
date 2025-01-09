import Header from "../../User/Header";
import { useEffect, useState } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { notification, Spin } from "antd";

type UserListType = {
  role?: string;
  _id?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  __v?: number;
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserListType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(!isLoading);
    const fetchUsers = async () => {
      try {
        const response = await fetch(endpoints.users.getAllUsers, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setIsLoading(false);
        setUsers(data.data);
      } catch (error) {
        console.error("An error occurred:", error);
        notification.error({
          message: "Error fetching users",
          description:
            "An error occurred while fetching the user list. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="font-[gilroy-regular]">
      <Header title="Users Management" />
      <div>
        {isLoading ? (
          <div>
            <Spin />
          </div>
        ) : (
          <div>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">S/N</th>
                  <th className="border p-2">Annotator Full Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Username</th>
                  <th className="border p-2">Phone Number</th>
                  <th className="border p-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user?._id}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">
                      {user?.firstname} {user?.lastname}
                    </td>
                    <td className="border p-2">{user?.email}</td>
                    <td className="border p-2">{user?.username}</td>
                    <td className="border p-2">{user?.phone}</td>
                    <td className="border p-2">{user?.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
