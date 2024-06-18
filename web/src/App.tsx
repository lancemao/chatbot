
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import User from './sso/User';
import AppContext from './AppContext';
import { AppInfo } from './types/app';
import { checkOrSetAccessToken } from './chat/utils';
import { getAppInfo } from './api/network';

import DingTalk from './sso/DingTalk';

const App = () => {

  let { appCode } = useParams();
  
  const [user, setUser] = useState<User>(User.Guest);
  const [appInfo, setAppInfo] = useState<AppInfo>()

  useEffect(() => {
    if (appCode) {
      (async () => {
        try {
          // get user access token. for anoymous user, server will generate one.
          // currently, this has to be done before we can get app info since app info requires access token.
          await checkOrSetAccessToken(appCode);

          // next thing is to get app info. App is identified by appCode which is the last part of app url.
          // this design might be optimized by making some part of app info public, and when we start our app
          // we first get its public info, and then handle user login.
          // for example, in app's public info, it might require user to login using some specific id provider
          // our front end code can then handle user login accordingly.
          let info: AppInfo = await getAppInfo(appCode);
          setAppInfo(info);

          // not working in some env e.g. dingtalk, instead we should use js-api provided by those platforms.
          document.title = info.title;
        } catch (err) {
          console.error('Error initializing chat', err);
        }
      })();
    }
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, appInfo, setAppInfo}}>
      <DingTalk />
    </AppContext.Provider >
  );
}

export default App