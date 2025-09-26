import { useState } from "react";
import { Button } from "antd";
import PageModal from "../../../../components/Modal/PageModal";
import e2fTest from "../../../../assets/e2ftest/e2f.png";
const Start = () => {
  const [openMicro1, setOpenMicro1] = useState(false);
  const [openE2F, setOpenE2F] = useState(false);

  return (
    <div className="mt-6 bg-white shadow-md rounded-xl p-6 font-[gilroy-regular]">
      <h2 className="text-lg font-semibold mb-4">Start Your Assessments</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please complete the following certifications to become a verified
        annotator:
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="primary"
          className="!bg-secondary !text-white !font-[gilroy-regular]"
          onClick={() => setOpenMicro1(true)}
        >
          Micro1 Certification
        </Button>

        <Button
          type="primary"
          className="!bg-primary !text-white !font-[gilroy-regular]"
          onClick={() => setOpenE2F(true)}
        >
          e2f English Test
        </Button>
      </div>

      {/* Micro1 Modal */}
      <PageModal
        className=""
        openModal={openMicro1}
        onCancel={() => setOpenMicro1(false)}
        closable
        modalwidth="600px"
      >
        <div className="flex flex-col gap-4 font-[gilroy-regular]">
          <h3 className="text-lg font-semibold">Micro1 Certification</h3>
          <p>
            We use <b>Micro1</b> to verify your technical capability as a
            credible and qualified annotator. This ensures that only skilled
            annotators are selected for projects.
          </p>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>
              Click on <b>Start Test</b> below.
            </li>
            <li>You’ll be redirected to the Micro1 website.</li>
            <li>Sign up / Log in if required.</li>
            <li>Complete the certification test carefully.</li>
            <li>Take a screenshot of your final result for submission.</li>
          </ol>
          <div className="flex justify-end">
            <Button
              type="primary"
              className="!bg-secondary !text-white"
              onClick={() => window.open("https://micro1.ai", "_blank")}
            >
              Start Test
            </Button>
          </div>
        </div>
      </PageModal>

      {/* e2f Modal */}
      <PageModal
        className=""
        openModal={openE2F}
        onCancel={() => setOpenE2F(false)}
        closable
        modalwidth="600px"
      >
        <div className="flex flex-col gap-4 font-[gilroy-regular]">
          <h3 className="text-lg font-semibold">
            e2f English Proficiency Test
          </h3>
          <p>
            The <b>e2f English Test</b> helps us confirm your language fluency
            and ability to work with international teams.
          </p>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>
              Click on <b>Start Test</b> below.
            </li>
            <li>You’ll be redirected to the e2f testing platform.</li>
            <li>Create an account / Log in if required.</li>
            <li>Complete the English proficiency test.</li>
            <img className=" w-[90%]" src={e2fTest} alt="" />
            <li>Take a screenshot of your final result for submission.</li>
          </ol>
          <div className="flex justify-end ">
            <Button
              type="primary"
              className="!bg-primary !text-white font-[gilroy-regular] "
              onClick={() =>
                window.open(
                  "https://jobs.e2f.io/user/job-list?redirectToJobId=18cbb27d-1d00-4f0e-8675-96cd81f396b6",
                  "_blank"
                )
              }
            >
              Start Test
            </Button>
          </div>
        </div>
      </PageModal>
    </div>
  );
};

export default Start;
