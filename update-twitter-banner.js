import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import { TwitterClient } from 'twitter-api-client';
import { createImage } from '@resoc/create-img';

const updateTwitterBanner = async() => {
  let currentDay = -1;
  const activeDays = [];
  const log = await fs.promises.readFile('log.md', { encoding: 'utf8' });
  log.split('\n').forEach(line => {
    const m = line.match(/### Day (\d+):/);
    if (m) {
      const day = parseInt(m[1]);
      activeDays.push(day);
      if (day > currentDay) {
        currentDay = day;
      }
    }
  });

  const daysStatus = new Array(currentDay + 1).fill(false);
  activeDays.forEach(day => {
    daysStatus[day] = true;
  });

  console.log(`At day ${currentDay}`);
  console.log('Days I have been active', activeDays);
  console.log('Status, day by day', daysStatus);

  const bannerFileName = 'new-banner.png';

  await createImage(
    'resoc-twitter-banner/resoc.manifest.json',
    {
      day: currentDay.toString(),
      activity: daysStatus.map(status => ({ status: status ? 'completed' : 'missed' }))
    },
    { width: 1800, height: 600 },
    bannerFileName
  );

  console.log("New banner generated");

  const twitterClient = new TwitterClient({
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const banner = await fs.promises.readFile(bannerFileName, { encoding: 'base64' });

  await twitterClient.accountsAndUsers.accountUpdateProfileBanner({ banner });

  console.log("Twitter banner updated");
}

try {
  await updateTwitterBanner();
  console.log("Done!");
}
catch(e) {
  console.log(e);
}
