/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { spawn } = require('child_process');
const { validate, Joi } = require('express-validation');

module.exports = {
  name: '/playlist',
  async run(req, res, next) {
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    });

    const { id } = req.query;

    const plVideos = (await ytpl(id)).items;
    const plID = (await ytpl(id)).id;
    const plTitle = (await ytpl(id)).title;

    let dirID = `./src/playlists/${plID}`;

    if (!fs.existsSync(dirID)) {
      fs.mkdirSync(dirID);
    }

    try {
      plVideos.forEach((v) => {
        const audio = ytdl(v.id, { quality: 'highestaudio' });

        const ffmpegProcess = spawn(ffmpeg, [
          '-loglevel', '8', '-hide_banner',
          '-progress', 'pipe:3',
          '-i', 'pipe:4',
          '-map', '0:a',
          '-c:a', 'libmp3lame',
          `./src/playlists/${plID}/${v.index} - ${v.title}.mp3`,
        ], {
          windowsHide: true,
          stdio: [
            'inherit', 'inherit', 'inherit',
            'pipe', 'pipe', 'pipe',
          ],
        });

        const ffmpegStreamError = (err) => console.error(err);

        if (fs.existsSync(`./src/playlists/${plID}/${v.index} - ${v.title}.mp3`)) {
          console.warn(`${v.title} already exists!`);
          cp.execSync(`zip -r ${plTitle}.zip ./${plID}/*`, {
            cwd: './src/playlists',
          });

          return res.download(`./src/playlists/${plTitle}.zip`);
        }

        audio.pipe(ffmpegProcess.stdio[4]).on('error', ffmpegStreamError);

        ffmpegProcess.on('exit', (exitCode, err) => {
          if (exitCode === 1) {
            console.error(err);
          }
          res.end();
        });

        res.on('end', () => ffmpegProcess.kill());
      });
    } catch (error) {
      return next(error);
    }
  },
};
