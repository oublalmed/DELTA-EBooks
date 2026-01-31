/**
 * DELTA EBooks Mobile App Entry Point
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Initialize AdMob
import mobileAds from 'react-native-google-mobile-ads';

mobileAds()
  .initialize()
  .then((adapterStatuses) => {
    console.log('AdMob initialized:', adapterStatuses);
  })
  .catch((error) => {
    console.error('AdMob initialization error:', error);
  });

AppRegistry.registerComponent(appName, () => App);
