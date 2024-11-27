import { useState } from "react";

const UserList = () => {

    const [tasks] = useState([
        {
          id: 1,
          firstName: "John",
          email: "john.doe@example.com",
          username: "johndoe22",
          phoneNumber: "425465432",
          telegramUsername: "jhndoooe"

        },
        {
          id: 2,
          firstName: "Jane",
          email: "jane.smith@example.com",
          username: "janesmith24",
          phoneNumber: "8145645646",
          telegramUsername: "janesmitth"
        },
        {
            id: 3,
            firstName: "Jane",
            email: "jane.smith@example.com",
            username: "janesmith24",
            phoneNumber: "8145645646",
            telegramUsername: "janesmitth"
          },
          {
            id: 4,
            firstName: "Jane",
            email: "jane.smith@example.com",
            username: "janesmith24",
            phoneNumber: "8145645646",
            telegramUsername: "janesmitth"
          },
      ]);
  return (
    <div>
        <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">S/N</th>
            <th className="border p-2">Annotator Full Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">PhoneNumber</th>
            <th className="border p-2">Telegram Username</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{task.firstName}</td>
              <td className="border p-2">{task.email}</td>
              <td className="border p-2">
                {task.username}
              </td>
              <td className="border p-2">
               {task.phoneNumber}
              </td>
              <td className="border p-2">{task.telegramUsername}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserList