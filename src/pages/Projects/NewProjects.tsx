import { Button } from "antd";
// import { useState } from "react";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import Logo from "../../assets/deeptech.png"; // Adjust the path as necessary
import PageModal from "../../components/Modal/PageModal";
import SignUpForm from "./GetPaidToTrainAi/Signupform";

const projects = [
  {
    id: 1,
    title: "Get Paid to Train AI",
    status: "Active",
    duration: "ongoing",
    pay: "up to $40/hr",
    action: "Join Now",
    link: "https://example.com/image-annotation-project", // Example link, replace with actual
    projectDescription:
      "Participate in a survey to help improve AI models. This project involves answering simple questions. There are no specific skills required, just a willingness to share your thoughts.",
  },
  {
    id: 2,
    title: "AI Survey Project",
    status: "inactive",
    duration: "1 week",
    pay: "$60 on completion of project",
    action: "Join Now",
    link: "https://forms.gle/PgxEpLkddRTP7u4BA", // Example link, replace with actual
    projectDescription:
      "Participate in a survey to help improve AI models. This project involves answering simple questions. There are no specific skills required, just a willingness to share your thoughts.",
  },
  {
    id: 3,
    title: "Image Annotation Project",
    status: "Coming Soon",
    duration: "3 months",
    pay: "₦1,500 per hour (~₦180,000/month)",
    action: "Coming Soon",
    link: "https://example.com/image-annotation-project", // Example link, replace with actual
  },
];

const NewProjects = () => {
  // const [applied, setApplied] = useState<number | null>(null);

  const [open, setOpen] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  // const handleApply = (id: number) => {
  //   setApplied(id);
  //   // logic for applying can go here
  // };

  const handleOpen = (id: number) => {
    setOpen(open === id ? null : id);
  };

  return (
    <div className="">
      <div className="max-w-5xl mx-auto py-12 px-6 font-[gilroy-regular]">
        <div className="h-[50px]">
          <a href="/">
            <img className="h-full rounded-md" src={Logo} alt="Logo" />
          </a>
        </div>
        <h2 className="text-3xl font-bold text-center mb-10 text-[#333333]">
          Available Projects
        </h2>

        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 p-6 rounded-xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between bg-white"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-[#F6921E]">
                  {project.title}
                </h3>
                <div className="text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    Status:{" "}
                    <span
                      className={`font-semibold ${project.status === "Active"
                        ? "text-green-600"
                        : "text-gray-500"
                        }`}
                    >
                      {project.status}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-[#F6921E]" />
                    Duration: <span className="ml-1">{project.duration}</span>
                  </p>
                  <p>
                    Pay:{" "}
                    <span className="font-medium text-black">
                      {project.pay}
                    </span>
                  </p>
                  <div className="transition-all duration-300 ease-in-out">
                    <p
                      className="underline text-[#838281] cursor-pointer"
                      onClick={() => handleOpen(project.id)}
                    >
                      Read More
                    </p>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${open === project.id
                        ? "max-h-40 opacity-100 mt-2"
                        : "max-h-0 opacity-0"
                        } p-4 bg-gray-100 rounded-md`}
                      style={{
                        transitionProperty: "max-height, opacity, margin-top",
                      }}
                    >
                      <p className="text-sm text-gray-700">
                        {project.projectDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => setOpenModal(!openModal)}
                  disabled={project.status !== "Active"}
                  className={`!rounded-md !h-10 !px-5 !font-[gilroy-regular] ${project.status !== "Active" && "!bg-gray-300"
                    } ${project.status === "Active"
                      ? "!bg-green-600 !text-white"
                      : "!bg-[#333333] !text-white"
                    }`}
                >
                  {project.status === "Active" ? "Join Now" : "Coming Soon"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageModal
        openModal={openModal}
        onCancel={() => setOpenModal(false)}
        className=""
        closable={true}
        modalwidth="50rem"
      >
        <SignUpForm />
      </PageModal>
    </div>
  );
};

export default NewProjects;
