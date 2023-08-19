// import { fetchVideo } from "@prevter/tiktok-scraper";
// import { writeFileSync } from "fs";
// async function main() {
//   const url =
//     "https://www.tiktok.com/@aylara24.03/video/7265459731962121473?is_from_webapp=1&sender_device=pc";

//   // Using promise
//   fetchVideo(url)
//     .then(async (video) => {
//       const buffer = await video.download();
//       writeFileSync("video.mp4", buffer);
//       console.log("Video description:", video.description);
//       console.log("Video id:", video.id);
//       console.log("🔗 URL:", video.url);
//       console.log("👤 Author:", video.author);
//       console.log("❤️ Likes:", video.likes);
//       console.log("💬 Comments:", video.comments);
//       console.log("🔁 Shares:", video.shares);
//       console.log("▶️ Plays:", video.playCount);
//       console.log("🎵 Music:", video.music.name, "-", video.music.author);
//       console.log("🖼️ Thumbnail URL:", video.previewImageUrl);
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// }

// // main();
