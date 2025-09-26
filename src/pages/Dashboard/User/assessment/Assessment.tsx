
import Header from "../Header";
import Start from "./Start";
import Submit from "./Submit";


const Assessment = () => {
 

  return (
    <div className="font-[gilroy-regular] p-6">
      <Header title="Assessment" />

      {/* Start Section */}
     <Start/>

      {/* Submit Section */}
      <Submit/>
      
    </div>
  );
};

export default Assessment;
