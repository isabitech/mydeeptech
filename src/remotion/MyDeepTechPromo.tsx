import { AbsoluteFill, Series } from "remotion";

import { PlaceholderAudioTrack } from "./audio-cues";
import { SCENE_DURATIONS } from "./config";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Brand } from "./scenes/Scene2Brand";
import { Scene3Landing } from "./scenes/Scene3Landing";
import { Scene4Auth } from "./scenes/Scene4Auth";
import { Scene5Assessment } from "./scenes/Scene5Assessment";
import { Scene6Profile } from "./scenes/Scene6Profile";
import { Scene7Marketplace } from "./scenes/Scene7Marketplace";
import { Scene8Admin } from "./scenes/Scene8Admin";
import { Scene9Work } from "./scenes/Scene9Work";
import { Scene10Closing } from "./scenes/Scene10Closing";

export const MyDeepTechPromo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020512" }}>
      <PlaceholderAudioTrack />
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.hook}>
          <Scene1Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.brand}>
          <Scene2Brand />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.landing}>
          <Scene3Landing />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.auth}>
          <Scene4Auth />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.assessment}>
          <Scene5Assessment />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.profile}>
          <Scene6Profile />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.marketplace}>
          <Scene7Marketplace />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.admin}>
          <Scene8Admin />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.work}>
          <Scene9Work />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.closing}>
          <Scene10Closing />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
