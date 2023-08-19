import client from "../../../database/elasticsearch.client";

export async function ingestYtChannel(channel: any, id: string) {
  try {
    const response = await client.index({
      index: "yt_channels",
      pipeline: "yt_channel_pipeline",
      body: channel,
      id: id,
    });
    console.log("Data ingested successfully:", response);
    return true;
  } catch (err) {
    console.error("Error ingesting data:", err);
    return false;
  }
}

function hmsToSecondsOnly(str: string) {
  var p = str.split(":"),
    s = 0,
    m = 1;

  while (p.length > 0) {
    s += m * parseInt(`${p.pop()}`, 10);
    m *= 60;
  }

  return s;
}

interface Video {
  videoId: string;
  thumbnail: string[];
  title: string;
  shortDescription: string;
  descriptionSnippet: string;
  publishedTimeText: string;
  lengthText: string;
  lengthInSeconds: number;
  lengthDescription: string;
  viewCountText: string;
  shortViewCountText: string;
}

export async function ingestYtChannelVideos(
  videos: any[],
  channelId: string
): Promise<Video[]> {
  try {
    const result: Video[] = [];

    for (const video of videos) {
      const v: Video = {
        videoId: video.videoId,
        thumbnail:
          video.thumbnail?.thumbnails?.map((thumbnail: any) => thumbnail.url) ||
          [],
        title: video.title?.runs?.map((item: any) => item.text).join(",") || "",
        shortDescription:
          video.title?.accessibility?.accessibilityData?.label || "",
        descriptionSnippet: (
          video.descriptionSnippet?.runs?.map((item: any) => item.text) || []
        )
          .join(",")
          .trim(),
        publishedTimeText: video.publishedTimeText?.simpleText || "",
        lengthText: video.lengthText?.simpleText || "",
        lengthInSeconds: hmsToSecondsOnly(video.lengthText?.simpleText),
        lengthDescription:
          video.lengthText?.accessibility?.accessibilityData?.label || "",
        viewCountText: video.viewCountText?.simpleText || "",
        shortViewCountText: video.shortViewCountText?.simpleText || "",
      };

      result.push(v);
    }

    const bulkBody = result
      .map((v) => [
        {
          index: { _index: "yt_channel_video", _type: "_doc", _id: v.videoId },
        },
        v,
      ])
      .flat();

    await client.bulk({ body: bulkBody });
    return result;
  } catch (err) {
    console.error("Error:", err);
    return [];
  }
}

export async function ingestComments(videoId: string, comments: any) {
  try {
    const result: SecondComment[] = convertComments(comments, videoId);
    const bulkBody = result
      .map((v) => [
        {
          index: {
            _index: "yt_video_comments",
            _type: "_doc",
            _id: v.commentId,
          },
        },
        v,
      ])
      .flat();
    await client.bulk({ body: bulkBody });
    return result;
  } catch (err) {
    return [];
  }
}

interface SecondComment {
  authorText: string;
  authorThumbnail: string;
  contentText: string;
  publishedTimeText: string;
  voteCount: number;
  voteText: string;
  commentId: string;
  date: Date;
}

function convertComments(comments: any[], videoId: string): SecondComment[] {
  return comments.map((comment) => {
    const authorText = comment.authorText.simpleText;
    const commentId = comment.commentId;
    const authorThumbnail = comment.authorThumbnail.thumbnails[0].url;
    const contentText = comment.contentText.runs
      .map((run: any) => run.text)
      .join("")
      .trim();
    const publishedTimeText = comment.publishedTimeText.runs[0].text;
    let voteCount = 0;
    try {
      voteCount = parseInt(comment.voteCount?.simpleText);
    } catch (err) {}
    const voteText = comment.voteCount?.accessibility?.accessibilityData?.label;

    return {
      authorText,
      authorThumbnail,
      contentText,
      publishedTimeText,
      voteCount,
      voteText,
      videoId,
      commentId,
      date: new Date(),
    };
  });
}
