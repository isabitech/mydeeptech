import { BellOutlined, SearchOutlined } from "@ant-design/icons"
import { useUserContext } from "../../../UserContext";

type Props ={
    title: string;
}
const Header:React.FC<Props> = ({title}) => {
  const {userInfo} = useUserContext();
  return (
    <div><div className="  h-[3rem] flex px-2 items-center justify-between w-full ">
    <div className="">
      {" "}
      <p>{title}</p>
    </div>

    <div className=" flex justify-around  items-center gap-4 ">
      {/* Search box */}
      <div className=" h-[2rem] w-[15rem] border-secondary border-2 rounded-2xl relative">
        <SearchOutlined className=" absolute left-2 top-2 " />
        <input
          type="text"
          className=" h-full w-full p-2 border-none rounded-2xl pl-6 text-[14px]"
          placeholder="Search anything"
        />
      </div>
      {/* Notification */}
      <div className=" h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
        <BellOutlined />
      </div>
      {/* UserProfile */}
      <div className=" h-[2rem] w-[10rem] border-secondary border-2 rounded-2xl flex gap-2 ">
        <img
          src="https://banner2.cleanpng.com/20180622/tqt/aazen4lhc.webp"
          className="rounded-full"
          alt=""
        />
        <span>
          <p className="text-[10px]">{userInfo.firstName}{" "}{userInfo.lastName}</p>
          <p className="text-[9px]">{userInfo.email}</p>
        </span>
      </div>
    </div>
  </div></div>
  )
}

export default Header