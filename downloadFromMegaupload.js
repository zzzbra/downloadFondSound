const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

const config = {
  username,
  password,
} = require('./config');

async function runGetMega(urls) {
  // put mega-get into PATH if not already there
  await exec('export PATH=/Applications/MEGAcmd.app/Contents/MacOS:$PATH');
  await exec('source /Applications/MEGAcmd.app/Contents/MacOS/megacmd_completion.sh');

  // create session with Mega
  try {
    console.log('logging in')
    await exec(`mega-login ${username} ${password}`);
  } catch(error) {
    console.log('mega-login error: ', error);
  }

  console.log('running mega-get script');
  // filter urls for Mega Upload Urls
  const megaUrls = urls.split(',').filter(url => url.includes('mega'));

  // spawn child process that calls mega-get on each url
  for (let i = 51; i < 100; i++) {
    try {
      const { stdout, stderr } = await exec(`mega-get ${megaUrls[i]} /Users/zzzbra/Desktop/FONDSOUND`);
      console.log(`completed download #${i}`);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      await exec(`mega-logout`)
    } catch (error) {
      console.log('error: ', error);
      await exec(`mega-logout`)
    }
  }

  try {
    console.log('logging out');
    await exec(`mega-logout`);
  } catch (error) {
    console.log('logging out error: ', error);
  }
}

fs.readFile(
  path.join(__dirname, 'pageUrls.txt'),
  'utf8',
  (err, data) => {
    if (err) throw err;
    
    runGetMega(data);
  }
);
