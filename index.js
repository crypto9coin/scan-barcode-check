const { Telegraf } = require('telegraf');
const BarcodeReader = require('barcode-reader');
const Jimp = require('jimp');

const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN');

// Configure the barcode reader
const barcodeReader = new BarcodeReader();

// Middleware to handle barcode scanning
bot.on('photo', async (ctx) => {
    try {
        // Get the largest photo size
        const photo = ctx.update.message.photo.pop();

        // Download the photo
        const file = await ctx.telegram.getFile(photo.file_id);
        const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

        // Decode barcode from the photo
        const decodedBarcode = await decodeBarcode(url);

        // Send the decoded barcode to the user
        if (decodedBarcode) {
            ctx.reply(`Scanned Barcode: ${decodedBarcode}`);
        } else {
            ctx.reply('No barcode found in the photo.');
        }
    } catch (error) {
        console.error('Error processing photo:', error);
        ctx.reply('Error processing photo. Please try again.');
    }
});

// Function to decode barcode from an image URL
async function decodeBarcode(imageUrl) {
    try {
        // Load the image from the URL
        const image = await Jimp.read(imageUrl);

        // Convert the image to a buffer
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

        // Decode the barcode from the buffer
        const result = await barcodeReader.decode(buffer);

        // Extract and return the barcode data
        return result && result?.code;
    } catch (error) {
        console.error('Error decoding barcode:', error);
        return null;
    }
}

// Start the bot
bot.launch();
