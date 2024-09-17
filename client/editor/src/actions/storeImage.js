



const storeImage = async (fileName, imgData) => {

  const server_endpoint_url = 'http://localhost:5000/upload_image'; // refaktorovat ako parameter funkcie

  try {

    const response = await fetch(server_endpoint_url, {
      method: "POST",
      body: JSON.stringify({ image: imgData, filename: fileName }), // Send base64 data
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      alert("Image uploaded successfully!");
    } else {
      response.text().then(text => {
        alert(`Error uploading image: ${text}`);
      });
    }

  } catch (error) {
    console.error("Error:", error);
  }

};

export default storeImage;