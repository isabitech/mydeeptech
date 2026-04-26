import "./styles.css";

import { Composition } from "remotion";

import {
  TOTAL_DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "./config";
import { MyDeepTechPromo } from "./MyDeepTechPromo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyDeepTechPromo"
        component={MyDeepTechPromo}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        fps={VIDEO_FPS}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        defaultProps={{}}
      />
    </>
  );
};
