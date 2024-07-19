import React, {
  useEffect,
  useState,
} from 'react';

import styles from "./Screen.module.scss";

import Button from '../Button/Button';

// TODO: Put these in constants when the screen images are finalized
//  - or handle this in a better/dynamic way to allow screen resizing
const SCREEN_IMAGE_HEIGHT = 113;
const SCREEN_IMAGE_WIDTH = 200;

function Screen ({
  screen,
}) {
  const [ screenImage, setScreenImage ] = useState(null);
  const [ screenImageIsLoaded, setScreenImageIsLoaded ] = useState(false);
  const [ screenImageLoadingFailed, setScreenImageLoadingFailed ] = useState(false);
  const [ screenIsOnline, setScreenIsOnline ] = useState(false);
  const [ screenStatusIsLoaded, setScreenStatusIsLoaded ] = useState(false);

  /*
    TODO: 
     - Display the name of each screen
     - use screenIsOnline/screenStatusIsLoaded to display a circle to indicate if a screen is online
     - Ping screen to get status
     - Figure out best size for screens
     - Allow screens/screen image to resize responsively based on current viewport width
     - Use Puppeteer to get a screenshot of the menu webpages 
  */

  // on initial load
  useEffect(() => {
    // fetch image from `https://picsum.photos/${SCREEN_IMAGE_WIDTH}/${SCREEN_IMAGE_HEIGHT}`
    const fetchImage = async () => {
      try {
        // eventually use puppeteer (https://www.npmjs.com/package/puppeteer) on the backend
        //  to request and save a screenshot of the screen pages.

        const url = `https://picsum.photos/${SCREEN_IMAGE_WIDTH}/${SCREEN_IMAGE_HEIGHT}`;
        const response = await fetch(url);
        setScreenImage(response.url);
        setScreenImageIsLoaded(true);
      }
      catch (error) {
        // TODO: Maybe devise a better error handling approach?
        //handle error here
        setScreenImageLoadingFailed(true);
      }
    };

    fetchImage();

    // In future - ping screen to get status
  }, []);

  const screenImageJSX = screenImageIsLoaded ? (
    <img 
      src={screenImage}
    />
  ) : ( 
    <p>
      {
        screenImageLoadingFailed ? "Error." : "Loading..."
      }
    </p> 
  );

  return (
    <div className={styles.screen}>
      <div className={styles["screen-image-wrapper"]}>
        {screenImageJSX}
      </div>

      <div className={styles["screen-controls"]}>
        <Button
          label='Restart Screen'
        />
      </div>
    </div>
  )
}

export default Screen;
