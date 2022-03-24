import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import videojs from "video.js";
import "videojs-youtube";
import '@devmobiliza/videojs-vimeo/dist/videojs-vimeo.esm';
import 'videojs-vr';
// require('!style-loader!css-loader!video.js/dist/video-js.css');
require('!style-loader!css-loader!videojs-vr/dist/videojs-vr.css');


export const VideoJS = (props) => {
    const videoRef = useRef(null);
    const carouselID = useSelector(state => state.selectedItem);
    const playerRef = useRef(null);
    const { options, onReady } = props;

    useEffect(() => {
        // make sure Video.js player is only initialized once
        if (!playerRef.current) {
            const videoElement = videoRef.current;
            if (!videoElement) return;

            const player = (playerRef.current = videojs(videoElement, options, () => {
                console.log("player is ready");
                onReady && onReady(player);
                if (carouselID) carouselID.captions.forEach(track => player.addRemoteTextTrack(track));
                if (carouselID?.is_3d) {
                    player.mediainfo = player.mediainfo || {};
                    player.mediainfo.projection = '360';
                    player.vr({projection: 'AUTO'});
                }
            }));
            // player.pip();
        } else {
            // you can update player here [update player through props]
            // const player = playerRef.current;
            // player.autoplay(options.autoplay);
            // player.src(options.sources);
        }
    }, [options, onReady, videoRef]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player>
            {(carouselID?.format.includes("audio/") ? (
                <audio
                    poster={carouselID?.thumbnail}
                    ref={videoRef}
                    id="aviary-iiif-media-player"
                    className="video-js vjs-big-play-centered w-full"
                    crossOrigin="anonymous"
                />
            ) : (
                <video
                    poster={carouselID?.thumbnail}
                    ref={videoRef}
                    id="aviary-iiif-media-player"
                    className="video-js vjs-big-play-centered w-full"
                    data-setup='{"techOrder": [ "html5","youtube", "vimeo"]}'
                    crossOrigin="anonymous"
                />
            ))}
        </div>
    );
};

export default VideoJS;