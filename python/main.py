from TikTokApi import TikTokApi
from quart import Quart, jsonify,request
import asyncio
import os
import json

ms_token = os.environ.get(
    "ms_token", "dUI8nA0tm8Zl-gH9UhiHLn9uSHXWBFVga-q1LdoUaFRaicZwUM2TfKuNkenyvMgwhS7slU87-D-h_MVlK0xwuzkI7Rm--2GWaNuqdcIwmUfjwXWo4006XnJa4VCVsy8TXukslEuRgoBeXiU="
)  # set your own ms_token, think it might need to have visited a profile

app = Quart(__name__)

@app.route('/get-user-info', methods=['GET'])
async def async_endpoint():  
    data = await getUserData(request.args.get('username'))
    return jsonify(data)

@app.route('/get-video-info', methods=['GET'])
async def getVideoInfo():
    data = await get_comments(request.args.get('videoId'),request.args.get('comment_count'))
    return jsonify(data)

async def getUserData(username):
    print("Hello")
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=1, sleep_after=3)
        user = api.user(username)
        user_data = await user.info()
        # return user_data
        videos = []

        async for video in user.videos(count=user_data['userInfo']['stats']['videoCount']):
            try:
                videos.append(video.as_dict)
            finally:
                continue
        data = {
            "videos": videos,
            "user": user_data
        }
        return data
    
async def get_comments(video_id,comment_count):
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=1, sleep_after=3)
        video = api.video(id=video_id)
        comments = []
        async for comment in video.comments(count=int(comment_count),cursor=0):
            comments.append(comment.as_dict)
        return {
            "comments": comments
        }

if __name__ == '__main__':
    app.run(debug=True)