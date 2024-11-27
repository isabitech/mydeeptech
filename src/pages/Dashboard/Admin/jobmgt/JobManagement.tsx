import { useState } from "react";
import Header from "../../User/Header"
import Pending from "./Pending";
import Submitted from "./Submitted";
import Approved from "./Approved";
import Rejected from "./Rejected";

const JobManagement = () => {

  // State to track the currently selected project
  const [selectedProject, setSelectedProject] = useState(1); // Default to the first project

  // List of projects
  const list = [
    {
      key: 1,
      title: "Pending",
      component: <Pending />,
    },
    {
      key: 2,
      title: "Submitted",
      component: <Submitted />,
    },
    {
      key: 3,
      title: "Approved",
      component: <Approved/>,
    },
    {
      key: 4,
      title: "Rejected",
      component: <Rejected/>,
    },
  ];
  return (
    <div className="h-full flex flex-col gap-4  font-[gilroy-regular]">
    <Header title="Jobs" />

    <div className="flex gap-2">
        {list.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded ${
              selectedProject === item.key
                ? "bg-secondary text-white"
                : "bg-gray-300 text-black"
            }`}
            onClick={() => setSelectedProject(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Render the selected component */}
      <div className="mt-4">
        {list.find((item) => item.key === selectedProject)?.component}
      </div>
  </div>
  )
}

export default JobManagement;