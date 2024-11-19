import { BellOutlined, SearchOutlined, BarChartOutlined, CodeSandboxOutlined, ClockCircleOutlined, InboxOutlined } from "@ant-design/icons";

const Overview = () => {
  return (
    <div className=" h-full flex flex-col gap-4  font-[gilroy-regular]">
      {/* Header */}
      <div className="  h-[3rem] flex px-2 items-center justify-between w-full ">
       <div className=""> <p>Dashboard</p></div>

        <div className=" flex justify-around  items-center gap-4 ">
          {/* Search box */}
          <div className=" h-[2rem] w-[15rem] border-secondary border-2 rounded-2xl relative">
          <SearchOutlined className=" absolute left-2 top-2 " />
            <input type="text" className=" h-full w-full p-2 border-none rounded-2xl pl-6 text-[14px]" placeholder="Search anything" />
          </div>
          {/* Notification */}
          <div className=" h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
            <BellOutlined />
          </div>
          {/* UserProfile */}
          <div className=" h-[2rem] w-[10rem] border-secondary border-2 rounded-2xl flex gap-2 ">
            <img src="https://banner2.cleanpng.com/20180622/tqt/aazen4lhc.webp" className="rounded-full" alt="" />
            <span>
                <p className="text-[10px]">John Doe</p>
                <p className="text-[9px]">johndoe@gmail.com</p>
            </span>
          </div>
        </div>
        
      </div>
      <hr />
      {/* Content */}

<div className=" h-full ">
    {/* Cards */}
    <div className=" flex gap-2 justify-between text-white">
        {/* Revenue */}
        <div className=" w-[15rem] h-[15rem] bg-primary flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
            <BarChartOutlined />
            </span>
            <p className="text-[12px]">Total revenue</p>
            <p className="text-[2rem]">$45,000.00</p>
        </div>
        {/* Projects */}
        <div className=" w-[15rem] h-[15rem] bg-primary flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
            <CodeSandboxOutlined/>
            </span>
            <p className="text-[12px]">Projects</p>
            <p className="text-[2rem]">1<span className="text-[18px]">{"/"} 10</span></p>

            
        </div>

        {/* Time spent */}
        <div className=" w-[15rem] h-[15rem] bg-primary flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
            <ClockCircleOutlined/>
            </span>
            <p className="text-[12px]">Time spent</p>
            <p className="text-[2rem]">102<span className="text-[18px]">{"/"} 40Hrs</span></p>

        </div>

        {/* Resources */}
        <div className=" w-[15rem] h-[15rem] bg-primary flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
            <InboxOutlined/>
            </span>
            <p className="text-[12px]">Resources</p>
            <p className="text-[2rem]">10<span className="text-[12px]">{"/"} 120</span></p>

        </div>

    </div>
</div>

    </div>
  );
};

export default Overview;
