import { useState, useEffect } from "react";
import { Asset } from "expo-asset";

export function usePreloadImages(images) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [forceRender, setForceRender] = useState(0); // ✅ Forces UI to update

  useEffect(() => {
    let isMounted = true;

    async function loadImages() {
      console.log("Starting to load images...");
      try {
        const assets = images.map(image => Asset.fromModule(image).downloadAsync());
        await Promise.all(assets);
        console.log("All images loaded successfully.");

        if (isMounted) {
          setIsImageLoaded(true);
          setForceRender(prev => prev + 1); // ✅ Triggers a UI re-render
        }
      } catch (error) {
        console.error("Error loading images:", error);
      }
    }

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [images]); // ✅ Dependency added to re-run effect if `images` change

  return isImageLoaded;
}







