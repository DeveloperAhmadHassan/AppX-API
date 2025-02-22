import * as fs from 'fs';
import * as path from 'path';
import {cloudinary_options} from "./src/database/cloudinary.database";
import {v2 as cloudinary} from 'cloudinary';
import {sql} from "./src/database/neon.database";
import ffmpeg from 'fluent-ffmpeg';
import {getVideoDurationInSeconds} from 'get-video-duration';

const dirPath = path.join('D:', 'reels');
const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
const titles = [
    'Satisfying Pop 💥',
    'Epic Fail 😂',
    'Unbelievable Trick 🔥',
    'Amazing Stunt 🚀',
    'Smooth Moves ✨',
    'Viral Sensation 🔥',
    'Unexpected Twist 🌀',
    'Mind-Blowing Magic ✨',
    'Incredible Transformation 🔥',
    'Hilarious Moment 😂'
];

const getRandomTitle = () => {
    const randomIndex = Math.floor(Math.random() * titles.length);
    return titles[randomIndex];
};

async function uploadVideos() {
    try {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);

            if (fs.statSync(filePath).isFile()) {
                console.log(file);
                const cl = cloudinary_options;
                console.log(cloudinary_options);

                try {
                    const uploadResult = await cloudinary.uploader.upload(filePath, {
                        folder: "reels",
                        resource_type: "video",
                        public_id: `reel_${file}`,
                    });

                    console.log(uploadResult);
                    const likes = getRandomNumber(500, 5000);
                    const views = getRandomNumber(1000, 10000);
                    const reelTitle = getRandomTitle();
                    const uploadedResult = await sql`
                        INSERT INTO reels(reel_url, reel_thumbnail_url, likes, views, reel_title, value)
                        VALUES (${uploadResult["url"]}, 'https://example.com/thumb1.jpg', ${likes}, ${views}, ${reelTitle}, 10.5);
                    `;
                    console.log(uploadedResult);
                } catch (error: any) {
                    console.log('Error uploading file:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
    }
}


async function readCaptionFile(filePath: string) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        console.log(`Content of ${filePath}:`);
        console.log(data);
    } catch (error) {
        console.error(`Could not read file ${filePath}:`, error);
    }
}

async function extractTags(filePath: string) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const lines = data.split('\n');

        const tagsLineIndex = lines.findIndex(line => line.startsWith('Tags:'));

        if (tagsLineIndex !== -1 && lines[tagsLineIndex + 1]) {
            const tagsString = lines[tagsLineIndex + 1].trim();
            return tagsString.split(',').map(tag => tag.trim());
        } else {
            console.log(`No Tags found in ${filePath}`);
            return [];
        }
    } catch (error) {
        console.error(`Could not read file ${filePath}:`, error);
        return [];
    }
}

async function extractCategories(filePath: string) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const lines = data.split('\n');

        const categoriesLineIndex = lines.findIndex(line => line.startsWith('Categories:'));

        if (categoriesLineIndex !== -1 && lines[categoriesLineIndex + 1]) {
            const categoriesString = lines[categoriesLineIndex + 1].trim();
            return categoriesString.split(',').map(category => category.trim())
        } else {
            console.log(`No Categories found in ${filePath}`);
            return [];
        }
    } catch (error) {
        console.error(`Could not read file ${filePath}:`, error);
        return [];
    }
}

async function extractCaption(filePath: string) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const lines = data.split('\n');

        const captionLineIndex = lines.findIndex(line => line.startsWith('Caption:'));

        if (captionLineIndex !== -1 && lines[captionLineIndex + 1]) {
            return lines[captionLineIndex + 1].trim();
        } else {
            console.log(`No Caption found in ${filePath}`);
            return "";
        }
    } catch (error) {
        console.error(`Could not read file ${filePath}:`, error);
        return "";
    }
}

async function getVideoDuration(videoPath: string) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err: any, metadata) => {
            if (err) {
                reject(`Error getting video duration for ${videoPath}: ${err}`);
            } else {
                const duration = metadata.format.duration;
                resolve(duration);
            }
        });
    });
}

function sanitizePublicId(title: string): string {
    return title
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^-|-$|[^a-zA-Z0-9_-]/g, "");
}



async function checkVideos() {
    const rootDirectory = 'C:\\Users\\Zynth Digital\\Videos\\Dev team task';

    try {
        const folders = await fs.promises.readdir(rootDirectory);

        for (const folder of folders) {
            const folderPath = path.join(rootDirectory, folder);

            const innerFolders = await fs.promises.readdir(folderPath);

            for (const innerFolder of innerFolders) {
                const innerFolderPath = path.join(folderPath, innerFolder);
                const number = innerFolder[0];

                if (innerFolder.includes('Video')) {
                    const cl = cloudinary_options;
                    const videoFolderPath = path.join(innerFolderPath, innerFolder.replace(`${number}. `, ""));
                    const captionFilePath = path.join(innerFolderPath, 'caption.txt');

                    // Tile Cleaning

                    let tileFolderPath = path.join(innerFolderPath, 'Tile');
                    let tilePath = "", tileTitle = "";

                    fs.readdir(tileFolderPath, (err, files) => {
                        if (err) {
                            console.error('Error reading the directory:', err);
                            return;
                        }

                        const imageFiles = files.filter(file =>
                            file.toLowerCase().endsWith('.jpg') ||
                            file.toLowerCase().endsWith('.png') ||
                            file.toLowerCase().endsWith('.jpeg')
                        );

                        if (imageFiles.length > 0) {
                            const imagePath = path.join(tileFolderPath, imageFiles[0]);
                            const imageTitle = path.basename(imageFiles[0], path.extname(imageFiles[0]));

                            tilePath = imagePath;
                            tileTitle = imageTitle;
                        } else {
                            console.log('No image found in the folder.');
                        }
                    });

                    if (!tileFolderPath.toLowerCase().includes('tile')) {
                        tileFolderPath = path.join(innerFolderPath, 'Tile');
                    }

                    const videoFiles = await fs.promises.readdir(videoFolderPath);

                    let sizeInBytes = 0.0, sizeInMegaBytes = 0.0, videoDuration = 0.0;
                    let videoFilePath = "";

                    for (const videoFile of videoFiles) {
                        videoFilePath = path.join(videoFolderPath, videoFile);

                        if (videoFile.match(/^Video \d+_\d+/)) {
                            fs.stat(videoFilePath, (err, stats) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }

                                sizeInBytes = stats.size;
                                sizeInMegaBytes = stats.size/(1024*1024);
                            });
                            await getVideoDurationInSeconds(videoFilePath).then((duration) => {
                                videoDuration = duration;
                            })
                        }
                    }

                    console.log(videoFilePath);
                    console.log(`${sizeInBytes} bytes | ${sizeInMegaBytes} mb`);
                    console.log(videoDuration)

                    const tags = await extractTags(captionFilePath);
                    console.log(tags);
                    const categories = await extractCategories(captionFilePath);
                    console.log(categories);
                    const caption = await extractCaption(captionFilePath);
                    console.log(caption);

                    console.log(tilePath);
                    console.log(tileTitle);

                    let videoUrl = "", thumbnailUrl = "";

                    try {
                        const sanitizedTileTitle = sanitizePublicId(tileTitle);

                        const uploadVideoResult = new Promise((resolve, reject) => {
                            cloudinary.uploader.upload_large(videoFilePath, {
                                folder: "reels",
                                resource_type: "video",
                                public_id: `reel_${sanitizedTileTitle}`,
                            }, (error, result: any) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result.secure_url);
                                    videoUrl = result.secure_url;
                                }
                            });
                        });

                        console.log(await uploadVideoResult);

                        /* Make sure to upload a separate image file for the thumbnail */
                        const uploadImageResult = await cloudinary.uploader.upload(tilePath, {
                            folder: "thumbnails",
                            resource_type: "image",
                            public_id: `thumbnails_${sanitizedTileTitle}`,
                        });
                        //
                        console.log('Upload Video Result:', uploadVideoResult);
                        console.log('Upload Image Result:', uploadImageResult);

                        const likes = getRandomNumber(500, 5000);
                        const views = getRandomNumber(1000, 10000);

                        const uploadedResult = await sql`
                            INSERT INTO reels(
                                reel_url,
                                reel_thumbnail_url,
                                likes,
                                views,
                                reel_title,
                                tags,
                                categories,
                                video_duration,
                                video_size
                            )
                            VALUES (
                               ${videoUrl},
                               ${uploadImageResult["secure_url"]},
                               ${likes},
                               ${views},
                               ${caption},
                               ${tags},
                               ${categories},
                               ${videoDuration},
                               ${sizeInBytes}
                            );
                        `;

                        console.log('Database Insert Result:', uploadedResult);

                    } catch (error: any) {
                        console.error('Error uploading file:', error.message);
                        console.error('Error HTTP Code:', error.http_code);
                        console.error('Detailed Error:', error);
                    }


                }
            }
        }
    } catch (error) {
        console.error('Error reading the directory:', error);
    }
}

// Call the function
checkVideos();

