import { useState } from "react";
import Header from "../Header";
import ActiveProjects from "./ActiveProjects";
import AvailableProjects from "./AvailableProjects";
import PendingProjects from "./PendingProjects";
import RejectedProjects from "./RejectedProjects";

const Projects = () => {
  // State to track the currently selected project
  const [selectedProject, setSelectedProject] = useState(1); // Default to the first project

  // List of projects
  const list = [
    {
      key: 1,
      title: "Available Projects",
      component: <AvailableProjects />,
    },
    {
      key: 2,
      title: "Active Projects", 
      component: <ActiveProjects />,
    },
    {
      key: 3,
      title: "Pending Applications",
      component: <PendingProjects />,
    },
    {
      key: 4,
      title: "Rejected Applications",
      component: <RejectedProjects />,
    },
  ];

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      {/* Header */}
      <Header title="Projects" />
      
      {/* Navigation Buttons */}
      <div className="flex gap-2 flex-wrap">
        {list.map((item) => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded transition-colors ${
              selectedProject === item.key 
                ? "bg-secondary text-white" 
                : "bg-gray-300 text-black hover:bg-gray-400"
            }`}
            onClick={() => setSelectedProject(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Render the selected component */}
      <div className="mt-4 flex-1">
        {selectedProject === 1 && <AvailableProjects key={`tab-${selectedProject}`} />}
        {selectedProject === 2 && <ActiveProjects key={`tab-${selectedProject}`} />}
        {selectedProject === 3 && <PendingProjects key={`tab-${selectedProject}`} />}
        {selectedProject === 4 && <RejectedProjects key={`tab-${selectedProject}`} />}
      </div>
    </div>
  );
};

export default Projects;
