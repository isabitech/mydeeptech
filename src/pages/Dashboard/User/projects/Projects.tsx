import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ActiveProjects from "./ActiveProjects";
import AvailableProjects from "./AvailableProjects";
import PendingProjects from "./PendingProjects";
import RejectedProjects from "./RejectedProjects";
import SOPNDAViewer from "./SOPNDAViewer";

const Projects = () => {
  const [searchParams] = useSearchParams();
  const [selectedProject, setSelectedProject] = useState(1); // Default to the first project

  // Handle URL query parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'available') {
      setSelectedProject(1);
    } else if (tab === 'active') {
      setSelectedProject(2);
    } else if (tab === 'pending') {
      setSelectedProject(3);
    } else if (tab === 'rejected') {
      setSelectedProject(4);
    }
  }, [searchParams]);

  // Get projectId from URL to pass to AvailableProjects for highlighting
  const highlightProjectId = searchParams.get('projectId');

  // List of projects
  const list = [
    {
      key: 1,
      title: "Available Projects",
      component: <AvailableProjects highlightProjectId={highlightProjectId} />,
    },
    {
      key: 2,
      title: "My Active Projects",
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
      {/* Navigation Buttons */}
      <div className="flex gap-2 flex-wrap w-full">
        {list.map((item) => (
          <button
            key={item.key}
            className={`px-4 h-11 rounded transition-colors ${selectedProject === item.key
                ? "bg-secondary text-white"
                : "bg-gray-300 text-black hover:bg-gray-400"
              }`}
            onClick={() => setSelectedProject(item.key)}
          >
            {item.title}
          </button>
        ))}

        {/* Show SOP and NDA documents in modal */}
        <SOPNDAViewer />
       
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1">
        {list.find(item => item.key === selectedProject)?.component}
      </div>
      
     
    </div>
  );
};

export default Projects;
