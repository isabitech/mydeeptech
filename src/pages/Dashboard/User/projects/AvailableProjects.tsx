import {  ArrowsAltOutlined } from "@ant-design/icons"

const AvailableProjects = () => {

    const availableProjects = [
        {
            title: "Image Annotation Project",
            description: "This project involves annotating objects for autonomous vehicles",
            rate: "N1000",
            projectLink: "",
        },
        {
            title: "Video Annotation Project",
            description: "This project involves annotating objects for CCTV System",
            rate: "N2000",
            projectLink: "",
        },
        {
            title: "Text Annotation Project",
            description: "This project involves evaluating LLM responses",
            rate: "N2500",
            projectLink: "",
        },
        {
            title: "Audio Annotation Project",
            description: "This project involves trasncribing and translating language.",
            rate: "N1500",
            projectLink: "",
        },
    ]
  return (
    <div className=" font-[gilroy-regular] flex flex-col gap-2">
    <p>Available Projects</p>

   <div className=" flex gap-4 flex-wrap">
   {
        availableProjects.map((project, index) => ( <div className=" h-[20rem] w-[20rem] flex flex-col bg-white rounded-md hover:shadow-primary hover:shadow-sm cursor-pointer">
            {/* Image */}
            <div key={index} className="h-[50%] w-full" ><img className="h-[100%] w-full rounded-tr-md rounded-tl-md" src="https://plus.unsplash.com/premium_photo-1661436597788-920f2fa4cc7b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29ya2luZyUyMG9uJTIwY29tcHV0ZXJ8ZW58MHx8MHx8fDA%3D" alt="" /></div>
            {/* Text */}
            <div className=" p-4 flex flex-col justify-between h-full">
                    <div>
                        {/* Title */}
                    <p className=" font-bold text-lg">{project.title}</p>
                    {/* Project Description */}
                    <p className=" text-[#979090] text-[14px]">{project.description}</p>
                    </div>
                    <div className=" w-full flex justify-between ">
                            {/* Payment Rate */}
                            <span>{project.rate}{"/"} hr</span>
                            {/* Action */}
                            <span className=" text-secondary cursor-pointer"> Apply <ArrowsAltOutlined/> </span>
                    </div>
            </div>
        </div>))
    }
   </div>
   
</div>
  )
}

export default AvailableProjects