require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Replicate = require('replicate');
const path = require('path');
const fsSync = require('fs');

// Configure Cloudinary with credentials from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Replicate with the API token
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

const app = express();
const port = process.env.PORT || 3030;

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
    fsSync.mkdirSync(uploadsDir);
}

// Configure multer for file upload handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Handle file upload and process with Replicate API
app.post('/upload', upload.fields([{ name: 'garm_img' }, { name: 'human_img' }]), async (req, res) => {
    try {
        // Check if garm_img is selected from recommendation modal
        let garmImgUrl = req.body.selected_garm_img || ''; // This should match the field name in your form

        if (!garmImgUrl && req.files['garm_img']) {
            // Upload the image to Cloudinary if uploaded via form
            const garmImgResult = await cloudinary.uploader.upload(req.files['garm_img'][0].path, {
                folder: 'user_uploads',
            });
            garmImgUrl = garmImgResult.secure_url;
        }

        // Upload the human image to Cloudinary
        const humanImgResult = await cloudinary.uploader.upload(req.files['human_img'][0].path, {
            folder: 'user_uploads',
        });

        // Use the uploaded image URLs as input for the Replicate API
        const input = {
            garm_img: garmImgUrl,
            human_img: humanImgResult.secure_url,
            garment_des: 'user provided garment'
        };

        // Call Replicate API
        const output = await replicate.run("cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f", { input });

        // Generate the result page with links to start over and download the image
        const resultHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" type="text/css" href="style.css">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700&display=swap">
                <title>Virtual Try-On Result</title>
            </head>
            <body>
                <section id="result">
                    <div id="result-head">
                        <h1> Try-On Process Complete! </h1>
                        <p> You look as beautiful as always </p>
                        <div class="actions">
                            <a href="/" class="button" style="font-family: 'Jost',sans-serif">Try Something Else</a>
                            <a href="${output}" class="button" download="try-on-result.jpg" class="target">Download Image</a>
                        </div>
                    </div>  
                    <div class="result-container">
                        <div class="result-image-container">
                            <img src="${humanImgResult.secure_url}" alt="Human Image" class="result-img">
                        </div>
                        <p> + </p>
                        <div class="result-image-container">
                            <img src="${garmImgUrl}" alt="Garment Image" class="result-img">
                        </div>
                        <p> = </p>
                        <div class="result-image-container">
                            <img src="${output}" alt="Try-On Result" class="result-img">
                        </div>
                    </div>                      
                </section>
                <section id="footer">
                    <p>Copyright | Chidinma Oham | All rights reserved</p>
                </section>
            </body>
            </html>
        `;

        // Send the result HTML to the client
        res.send(resultHtml);

    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).send('Error processing images');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
