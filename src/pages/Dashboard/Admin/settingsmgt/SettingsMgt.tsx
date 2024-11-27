import Header from "../../User/Header";
import Reset from "../../User/settings/Reset";

const SettingsMgt = () => {
  return (
    <div className="h-full flex flex-col gap-4  font-[gilroy-regular]">
      <Header title="Setings" />

      <Reset />
      {/* <Component/>

    <Analysis/> */}
    </div>
  );
};

export default SettingsMgt;
