import axios from "axios";
import jsdom from "jsdom";
import {
  ingestComments,
  ingestYtChannel,
  ingestYtChannelVideos,
} from "./comments.writer";

const { JSDOM } = jsdom;

const getFirstPage = async (url: string) => {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const start = '{"CLIENT_CANARY_STATE"';
    const end = "window.ytcfg.obfuscatedData";
    const start_index = `${response.data}`.indexOf(start);
    const end_index = `${response.data}`.indexOf(end);
    const ytbObject = JSON.parse(
      `${response.data}`.substring(start_index, end_index - 3)
    );
    const apiKey = ytbObject["INNERTUBE_API_KEY"];
    const { document } = dom.window;
    const commentsContainer = document.getElementById("comments");
    const commentsContent =
      commentsContainer?.getElementsByClassName("ytd-comments")[0];

    const metaTags = document.getElementsByTagName("meta");
    const spanTags = document.getElementsByTagName("span");
    let videoProps: any = {};
    for (let i = 0; i < metaTags.length; i++) {
      if (metaTags[i].getAttribute("property") === "og:title") {
        videoProps = {
          ...videoProps,
          title: metaTags[i].getAttribute("content"),
        };
      }
      if (metaTags[i].getAttribute("property") === "og:image") {
        videoProps = {
          ...videoProps,
          image: metaTags[i].getAttribute("content"),
        };
      }
      if (metaTags[i].getAttribute("property") === "og:description") {
        videoProps = {
          ...videoProps,
          description: metaTags[i].getAttribute("content"),
        };
      }

      if (metaTags[i].getAttribute("name") === "og:keywords") {
        videoProps = {
          ...videoProps,
          keywords: metaTags[i].getAttribute("content"),
        };
      }

      if (metaTags[i].getAttribute("itemprop") === "duration") {
        videoProps = {
          ...videoProps,
          duration: metaTags[i].getAttribute("content"),
        };
      }
    }

    for (let i = 0; i < spanTags.length; i++) {
      if (spanTags[i].getAttribute("itemprop") === "author") {
        videoProps = {
          ...videoProps,
          author: {
            url: spanTags[i].getElementsByTagName("link")[0].href,
            name: spanTags[i]
              .getElementsByTagName("link")[1]
              .getAttribute("content"),
          },
        };
      }
      if (spanTags[i].getAttribute("itemprop") === "thumbnail") {
        videoProps = {
          ...videoProps,
          thumbnail: spanTags[i].getElementsByTagName("link")[0].href,
        };
      }
    }

    return {
      props: videoProps,
      apiKey,
      document,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getVideoDetail = async (videoId: string) => {
  const baseUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const page = await getFirstPage(baseUrl);
  const scripst = page?.document.getElementsByTagName("script");
  let responseContext: any = {};

  if (scripst) {
    for (let i = 0; i < scripst.length; i++) {
      if (scripst[i].outerHTML.includes('{"responseContext"')) {
        const html = scripst[i].outerHTML;
        const start = html.indexOf('{"responseContext"');
        const end = html.indexOf("}}}};");
        responseContext = JSON.parse(html.substring(start, end + 4));
      }
    }
  }

  let more =
    responseContext.contents.twoColumnWatchNextResults.results.results.contents.filter(
      (it: any) =>
        it?.itemSectionRenderer?.contents[0]?.continuationItemRenderer
    );
  let comments: any[] = [];
  let ress: any[] = [];
  if (more.length > 0) {
    let isLoad = true;

    more = more[0].itemSectionRenderer?.contents[0];

    while (isLoad) {
      let nextPage =
        more.continuationItemRenderer?.continuationEndpoint?.continuationCommand
          ?.token;
      const request = {
        context: {
          adSignalsInfo: {
            params: [
              {
                key: "dt",
                value: "1691748825346",
              },
              {
                key: "flash",
                value: "0",
              },
              {
                key: "frm",
                value: "0",
              },
              {
                key: "u_tz",
                value: "300",
              },
              {
                key: "u_his",
                value: "8",
              },
              {
                key: "u_h",
                value: "1080",
              },
              {
                key: "u_w",
                value: "1920",
              },
              {
                key: "u_ah",
                value: "972",
              },
              {
                key: "u_aw",
                value: "1920",
              },
              {
                key: "u_cd",
                value: "24",
              },
              {
                key: "bc",
                value: "31",
              },
              {
                key: "bih",
                value: "887",
              },
              {
                key: "biw",
                value: "1016",
              },
              {
                key: "brdim",
                value: "0,32,0,32,1920,32,1920,972,1016,887",
              },
              {
                key: "vis",
                value: "1",
              },
              {
                key: "wgl",
                value: "true",
              },
              {
                key: "ca_type",
                value: "image",
              },
            ],
          },
          clickTracking: {
            clickTrackingParams: "CMUFELsvGAMiEwiwisq9r9SAAxWgwk8IHVjIAVo=",
          },
          client: {
            acceptHeader:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            browserName: "Firefox",
            browserVersion: "115.0",
            clientFormFactor: "UNKNOWN_FORM_FACTOR",
            clientName: "WEB",
            clientVersion: "2.20230809.00.00",
            configInfo: {
              appInstallData:
                "CNeT2KYGENShrwUQqcSvBRCPo68FENuvrwUQ-r6vBRCG2f4SEMzfrgUQpcL-EhDcz68FEOzYrwUQrLevBRDZ1K8FEOSz_hIQls6vBRDuoq8FEOrDrwUQw92vBRDrk64FEInorgUQ3ravBRCPz68FEPOorwUQzK7-EhDC3v4SEJPPrwUQtMmvBRDgtq8FENzgrwUQ4tSuBRCMy68FEL22rgUQmtGvBRCPw68FEIKlrwUQtaavBRC4i64FEOe6rwUQkc-vBRCQ2K8FEJLLrwUQlNn-EhD956gYEJzWrwU%3D",
            },
            deviceExperimentId:
              "ChxOekkyTmpBd05UZzJPREU1TkRnNU5EWTRNUT09ENeT2KYGGNeT2KYG",
            deviceMake: "",
            deviceModel: "",
            gl: "US",
            hl: "ru",
            mainAppWebInfo: {
              graftUrl: "https://www.youtube.com/watch?v=MUl-bvDw9vc",
              isWebNativeShareAvailable: false,
              pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_UNKNOWN",
              webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
            },
            originalUrl: "https://www.youtube.com/watch?v=MUl-bvDw9vc",
            osName: "X11",
            osVersion: "",
            platform: "DESKTOP",
            remoteHost: "95.85.112.106",
            screenDensityFloat: 1,
            screenHeightPoints: 887,
            screenPixelDensity: 1,
            screenWidthPoints: 1016,
            timeZone: "Asia/Ashgabat",
            userAgent:
              "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0,gzip(gfe)",
            userInterfaceTheme: "USER_INTERFACE_THEME_DARK",
            utcOffsetMinutes: 300,
            visitorData: "CgtWRXVMQXR6UzNsUSjXk9imBjIICgJUTRICGgA%3D",
          },
          request: {
            consistencyTokenJars: [],
            internalExperimentFlags: [],
            useSsl: true,
          },
          user: {
            lockedSafetyMode: false,
          },
        },
        continuation: nextPage,
      };
      const res = await axios.post(
        `https://www.youtube.com/youtubei/v1/next?key=${page?.apiKey}&prettyPrint=false`,
        request
      );

      const commentsContainer = res.data.onResponseReceivedEndpoints.filter(
        (it: any) =>
          it.reloadContinuationItemsCommand?.targetId === "comments-section" ||
          it.appendContinuationItemsAction?.targetId === "comments-section"
      );
      if (commentsContainer.length > 0) {
        commentsContainer.forEach((it: any) => {
          const comment = it.reloadContinuationItemsCommand
            ? it.reloadContinuationItemsCommand?.continuationItems
            : it.appendContinuationItemsAction?.continuationItems;
          comments.push(
            ...comment
              .filter((it2: any) => it2.commentThreadRenderer)
              .map(
                (it3: any) => it3.commentThreadRenderer.comment.commentRenderer
              )
          );
        });

        more = res.data.onResponseReceivedEndpoints
          ?.concat()
          .reverse()[0]
          .reloadContinuationItemsCommand?.continuationItems?.filter(
            (it: any) => it.continuationItemRenderer
          )[0];
        if (!more || typeof more === "undefined" || more == null) {
          more = res.data.onResponseReceivedEndpoints
            ?.concat()
            .reverse()[0]
            .appendContinuationItemsAction?.continuationItems?.filter(
              (it: any) => it.continuationItemRenderer
            )[0];
        }
        isLoad =
          res.data.onResponseReceivedEndpoints
            ?.concat()
            .reverse()[0]
            .reloadContinuationItemsCommand?.continuationItems?.filter(
              (it: any) => it.continuationItemRenderer
            ).length > 0;
        if (!isLoad) {
          isLoad =
            res.data.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems.filter(
              (it: any) => it.continuationItemRenderer
            ).length > 0;
        }

        ress.push(res.data);
      } else {
        isLoad = false;
      }
    }
  }

  const prettyComments = await ingestComments(videoId, comments);

  return {
    page,
    prettyComments,
    comments,
    responseContext,
  };
};

const getChannelVideos = async (more: any, apiKey: string) => {
  try {
    const request = {
      context: {
        adSignalsInfo: {
          params: [
            {
              key: "dt",
              value: "1691735789728",
            },
            {
              key: "flash",
              value: "0",
            },
            {
              key: "frm",
              value: "0",
            },
            {
              key: "u_tz",
              value: "300",
            },
            {
              key: "u_his",
              value: "8",
            },
            {
              key: "u_h",
              value: "1080",
            },
            {
              key: "u_w",
              value: "1920",
            },
            {
              key: "u_ah",
              value: "972",
            },
            {
              key: "u_aw",
              value: "1920",
            },
            {
              key: "u_cd",
              value: "24",
            },
            {
              key: "bc",
              value: "31",
            },
            {
              key: "bih",
              value: "887",
            },
            {
              key: "biw",
              value: "1016",
            },
            {
              key: "brdim",
              value: "0,32,0,32,1920,32,1920,972,1016,887",
            },
            {
              key: "vis",
              value: "1",
            },
            {
              key: "wgl",
              value: "true",
            },
            {
              key: "ca_type",
              value: "image",
            },
          ],
        },
        clickTracking: {
          clickTrackingParams: "CAAQhGciEwiQ9eub_9OAAxU83U8IHYBVDvc=",
        },
        client: {
          acceptHeader:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          browserName: "Firefox",
          browserVersion: "115.0",
          clientFormFactor: "UNKNOWN_FORM_FACTOR",
          clientName: "WEB",
          clientVersion: "2.20230809.00.00",
          configInfo: {
            appInstallData:
              "CO2t16YGEOSz_hIQksuvBRCst68FEKnErwUQkc-vBRDC3v4SELTJrwUQ4tSuBRCa0a8FEOzYrwUQj8OvBRDzqK8FENzPrwUQvbauBRCPo68FEMzfrgUQ65OuBRCMy68FEMyu_hIQ2dSvBRCPz68FEJTZ_hIQw92vBRDc4K8FEKXC_hIQieiuBRD6vq8FELiLrgUQkNivBRCWzq8FEO6irwUQgqWvBRDnuq8FEP3nqBgQ4LavBRDbr68FEN62rwUQhtn-EhDUoa8FEOrDrwUQk8-vBRC1pq8FEJzWrwU%3D",
          },
          deviceExperimentId:
            "ChxOekkyTlRrME9UZzROelF5TVRVd056UTJOdz09EO2t16YGGO2t16YG",
          deviceMake: "",
          deviceModel: "",
          gl: "US",
          hl: "ru",
          mainAppWebInfo: {
            graftUrl: "https://www.youtube.com/@flutterdev/videos",
            isWebNativeShareAvailable: false,
            pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_UNKNOWN",
            webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
          },
          originalUrl: "https://www.youtube.com/@flutterdev/videos",
          osName: "X11",
          osVersion: "",
          platform: "DESKTOP",
          remoteHost: "95.85.112.106",
          screenDensityFloat: 1,
          screenHeightPoints: 887,
          screenPixelDensity: 1,
          screenWidthPoints: 1016,
          timeZone: "Asia/Ashgabat",
          userAgent:
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0,gzip(gfe)",
          userInterfaceTheme: "USER_INTERFACE_THEME_DARK",
          utcOffsetMinutes: 300,
          visitorData: "CgtWRXVMQXR6UzNsUSjtrdemBjIICgJUTRICGgA%3D",
        },
        request: {
          consistencyTokenJars: [],
          internalExperimentFlags: [],
          useSsl: true,
        },
        user: {
          lockedSafetyMode: false,
        },
      },
      continuation:
        more?.continuationItemRenderer?.continuationEndpoint
          ?.continuationCommand?.token,
    };
    const data = await axios.post(
      `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}&prettyPrint=false`,
      request
    );
    return data.data;
  } catch (err) {
    return null;
  }
};

const getChannelDetails = async (channelId: string) => {
  try {
    const baseUrl = `https://www.youtube.com/${channelId}/videos`;
    const page = await getFirstPage(baseUrl);
    const isIngested = await ingestYtChannel(page?.props, channelId);

    const scripst = page?.document.getElementsByTagName("script");
    let videos: any = {};
    if (scripst) {
      for (let i = 0; i < scripst.length; i++) {
        if (scripst[i].outerHTML.includes('{"responseContext"')) {
          const html = scripst[i].outerHTML;
          const start = html.indexOf('{"responseContext"');
          const end = html.indexOf("}]}}};");
          videos = JSON.parse(html.substring(start, end + 5));
        }
      }
    }
    let lastVideos = videos.contents.twoColumnBrowseResultsRenderer.tabs.find(
      (tab: any) => tab.tabRenderer.title === "Videos"
    );

    let isLoadMore = false;

    let more = lastVideos.tabRenderer.content.richGridRenderer.contents.find(
      (it: any) => it.continuationItemRenderer
    );
    let isLoad = more && typeof more !== "undefined" && more !== null;
    let nextVideos: any = [];
    while (isLoad) {
      const data = await getChannelVideos(more, page?.apiKey);
      try {
        nextVideos.push(
          ...data?.onResponseReceivedActions[0]?.appendContinuationItemsAction?.continuationItems?.map(
            (video: any) =>
              video.richItemRenderer
                ? video.richItemRenderer?.content?.videoRenderer
                : null
          )
        );
      } catch (e) {
        continue;
      }
      more =
        data.onResponseReceivedActions[0].appendContinuationItemsAction?.continuationItems?.filter(
          (it: any) => it.continuationItemRenderer
        )[0];
      isLoad =
        data.onResponseReceivedActions[0].appendContinuationItemsAction?.continuationItems?.filter(
          (it: any) => it.continuationItemRenderer
        ).length > 0;
    }

    const v1 = lastVideos.tabRenderer.content.richGridRenderer.contents
      .map((video: any) => {
        isLoadMore = video.continuationItemRenderer ? true : false;
        return video.richItemRenderer
          ? video.richItemRenderer?.content?.videoRenderer
          : null;
      })
      .filter((it: any) => it !== null);

    const v2 = nextVideos.filter((it: any) => it !== null);

    const prettyVideos = await ingestYtChannelVideos([...v1, ...v2], channelId);

    return {
      page,
      videos: [...v1, ...v2],
      prettyVideos,
      tabs: lastVideos,
      isLoadMore,
    };
  } catch (err) {
    throw err;
  }
};

export { getVideoDetail, getChannelDetails };
