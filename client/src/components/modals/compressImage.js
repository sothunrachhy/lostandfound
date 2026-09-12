
export const compressImage = (file, maxDimension = 1200, quality = 0.8, callback) => {
  const reader = new FileReader();
  reader.onerror = () => {
    console.error("FileReader failed");
    callback('');
  };
  reader.onload = (e) => {
    const rawDataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width || 800;
        let height = img.height || 600;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        callback(compressed || rawDataUrl);
      } catch (err) {
        console.error("Canvas compression error:", err);
        callback(rawDataUrl);
      }
    };
    img.onerror = () => {
      console.error("Image load failed");
      callback(rawDataUrl);
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
};
