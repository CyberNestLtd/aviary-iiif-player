export function getVideos(jsonData) {
    let videos = [];
    for (let i = 0; i < jsonData.items.length; i++) {
        let video = {...jsonData?.items[i]?.items[0]?.items[0]?.body};
        video["thumbnail"] = jsonData?.items[i]?.thumbnail[0]?.id;
        video["videoCount"] = "item-" + i;
        video["manifest_URL"] = jsonData.id;
        video["label"] = jsonData?.items[i]?.label?.en[0];
        videos.push(video);
    }
    return videos;
}

export function getPlayerInfo(jsonData) {
    let video = getVideos(jsonData)[0];
    video.value = true;
   return  {
        label: jsonData.label.en[0],
        logoInformation: jsonData.provider,
        logoImage: jsonData.provider[0].logo[0].id,
        pageLink: jsonData.provider[0].homepage[0].id,
        firstVideo: video
    }
}

export function getTranscripts(data, itemNo) {
    let annotations = [];
    if (data?.items && data?.items[itemNo]?.annotations) {
        let items = data?.items[itemNo]?.annotations;
        for (let i = 0; i < items.length; i++) {
            annotations.push({
                label: items[i].label?.en[0],
                transcript: formatIndexes(items[i].items)
            });
        }
    }
    
    return annotations;
}

export function getMetadata(data) {
    return data.metadata;
}

export function isType(type, val) {
    return val.constructor.name.toLowerCase() === type.toLowerCase();
}

export function getHHMMSSFromSeconds(totalSeconds) {
    if (!totalSeconds) {
      return "00:00:00";
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hhmmss =
      padTo2(hours) + ":" + padTo2(minutes) + ":" + padTo2(seconds);
    return hhmmss;
  }

  // function to convert single digit to double digit
  function padTo2(value) {
    if (!value) {
      return "00";
    }
    return value < 10 ? String(value).padStart(2, "0") : value;
  }

  export function parseAnnotation(point) {
    let content = "";
    if (isType('array', point.body)) {
        let values = [];
        point.body.map(({ value }, key) => {
            values.push(value.replaceAll("\n", "<br/>"));
          });
        content = values.join(" ")
    } else {
        content = point.body.value.replaceAll("\n", "<br/>");
    }
    const hash = { text: content }
    const params = new URLSearchParams(point.target.split("#")[1]);
    if (params.has("t")) {
        let time = params.get("t").split(",");
        hash.starttime = time[0];
        hash.endtime = time[1];
    }
    return hash;
} 

function formatIndexes(transcript) {
    let newTranscript = {};
    transcript.map((point, index) => {
        let hash = parseAnnotation(point);
        (!newTranscript.hasOwnProperty(hash.starttime)) ? 
        newTranscript[hash.starttime] = hash : newTranscript[hash.starttime]['text'] += "<br >" + hash["text"];
    });
    return Object.values(newTranscript);
}