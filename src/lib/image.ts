// write a function that takes file | null then return a base64 string of an image, resize it to fit 1024 x 1024, keep the aspect ratio, and return the base64 string
export const resizeImage = async (file: File | null): Promise<string | null> => {
  if (!file) return null;

  const image = new Image();
  const reader = new FileReader();

  const promise = new Promise<string>((resolve) => {
    reader.onload = () => {
      image.src = reader.result as string;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve("");
          return;
        }

        const aspectRatio = image.width / image.height;
        const maxSize = 1024;

        let width = maxSize;
        let height = maxSize;

        if (aspectRatio > 1) {
          height = maxSize / aspectRatio;
        } else {
          width = maxSize * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg"));
      };
    };
  });

  reader.readAsDataURL(file);

  return promise;
};
