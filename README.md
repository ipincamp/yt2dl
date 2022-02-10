# YT2MP3 ~ Online YouTube Audio & Video Downloader.

## Instructions

1. Go to link [here](https://y2v.herokuapp.com/).
2. Put the link in the box provided.
3. Link can be `https://www.youtube.com/watch?v=ID` or
   `https://www.youtu.be/ID`
4. Press the **Search** button.
5. Click the dropbox below the video information,
   select the type you want to download.
6. Press **Download** button to save media in your device.
7. Wait until the download process is complete.

## Code Flow
> - Server is online.<br>
> - The user enters the url link as input.<br>
> - Here the `express` package works, `express-validation` will validate the url. If the value is met it will be sorted and only provide the `ID` value which will be processed to the `API`.<br>
> - For the `API` it uses `ytdl-core`, and outputs the return value to json as the response.<br>
> - If true, `ytdl` package will stream using the `ffmpeg-static` package as the engine.<br>
> - Here is the problem, when you are streaming, the output value is immediately received by the user without having to wait for the stream process to finish first.<br>
> - This causes the download size to be unknown, let me know if you have a method where it will be stored in a database, then retrieve it when the user requests it.<br>
> - When downloading, the file name will match the title stated in the `API`.<br>
> - When the streams complete, the role of the `sanitize-filename` package starts to act. He will collect information as the streams take place. If any problems are detected, the streams will be canceled and give an output value in the console.<br>
> - If the process went smoothly, the program will return to the starting point and ready to be used again by refreshing your browser.

## License

yt2mp3 is under license [GPL-3.0](https://github.com/ipincamp/yt2mp3/blob/c535b854472abdb1b0aa1575edc1afcf96071531/LICENSE).
