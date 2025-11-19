import cv2
import numpy as np
import base64

def process_image(image-bytes: bytes):
  nparr = np.frombuffer(image-bytes, np.uint8)
  img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
  if img is None:
    return("error: image cannot be decoded")

    gray= cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred= cv2.GaussianBlur(gray, (5,5), 0)
    edged= cv2.Canny(blurred, 50, 150)

    edge_count= int(np.sum(edges>0))
    total_pixels=edges.size
    edge_ratio= edge_count/total_pixels

    lap=cv2.Laplacian(gray, cv2.CV_64F)
    sharpness= float(lap.var())

    small= cv2.resize(img,(img.shape[1]//4, img.shape[0]//4))
    buf=cv2.imencode('.jpg', small,[int(cv2.IMWRITE_JPEG_QUALITY), 80])
    thumbnail=buf[1].tobytes()

    return {
      "edge_ratio": edge_ratio,
      "sharpness": sharpness,
      "preview": f"data:image/jpeg;base64"{b64"}
    }


