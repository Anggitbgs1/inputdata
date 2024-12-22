const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false });
    console.log('Browser launched');

    // Fungsi untuk memproses satu batch data
    const processBatch = async (entry, browser) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        console.log('New page created for batch processing');

        // Pertanyaan dalam form
        const questions = [
            { name: " merupakan iklan yang menarik." },
            { name: " menunjukkan bahwa produk tersebut cocok untuk disajikan dalam kondisi apapun." },
            { name: " mampu membuat saya tertarik untuk membeli produk Kopi ABC." },
            { name: "4. Saya menyukai iklan TikTok Kopi ABC versi Iqbaal Ramadhan X Eca" },
            { name: "5. Saya memiliki keyakinan bahwa produk " },
            { name: "6. Pesan yang disampaikan dalam iklan TikTok Kopi ABC versi Iqbaal" },
            { name: "7. Saya tertarik untuk membeli produk Kopi ABC setelah melihat iklan" },
            { name: " membuat saya menjadi mengetahui lebih banyak tentang produk tersebut. " },
            { name: "9. Iklan TikTok Kopi ABC versi Iqbaal Ramadhan X Eca Aura membuat saya" },
            { name: "10. Cerita dan situasi dalam iklan TikTok Kopi ABC versi Iqbaal Ramadhan X Eca Aura " },
            { name: "11. Informasi yang disampaikan dalam iklan TikTok Kopi ABC versi Iqbaal Ramadhan X" },
            { name: " memberikan informasi yang mudah dimengerti tentang produk Kopi ABC." },
            { name: " mampu menyampaikan pesan bahwa Kopi ABC adalah solusi untuk kebutuhan kopi sehari-hari." },
            { name: "14. Saya dapat menyimpulkan isi pesan yang disampaikan " },
            { name: "15. Saya akan melakukan pembelian produk Kopi ABC" },
            { name: "16. Saya akan merekomendasikan produk Kopi ABC" },
            { name: "17. Saya akan menempatkan Kopi ABC " },
            { name: "18. Saya akan mencari tahu mengenai " },
        ];

        const [name, email, gender, age, occupation, ...responses] = entry.split(',').map(item => item.trim());

        try {
            console.log(`Processing form for ${name} (${email})`);

            await page.goto("https://forms.gle/yj2nQd6iPqPzEw816", { waitUntil: 'networkidle' });
            console.log(`Navigated to form for ${name}`);

            // Isi form
            await page.getByLabel("Email Anda").fill(email);
            console.log(`Filled email for ${name}`);
            await page.getByLabel("Nama *").fill(name);
            console.log(`Filled name for ${name}`);
            await page.getByLabel(gender).click();
            console.log(`Selected gender for ${name}`);
            await page.getByLabel(age).click();
            console.log(`Selected age for ${name}`);

            // Menangani pekerjaan secara lebih hati-hati
            const occupationLabel = occupation === "Pekerja" ? "Pekerja" : occupation;
            console.log(`Selecting occupation: ${occupationLabel}`);
            await page.waitForSelector(`label:has-text("${occupationLabel}")`);
            await page.locator(`label:has-text("${occupationLabel}")`).click();
            console.log(`Selected occupation for ${name}`);

            await page.getByRole("button", { name: "Berikutnya" }).click();
            console.log(`Clicked next button for ${name}`);

            // Isi jawaban
            for (let i = 0; i < responses.length; i++) {
                const questionName = questions[i].name;
                const responseValue = responses[i];

                console.log(`Answering question: "${questionName}" with response: "${responseValue}"`);
                await page.getByLabel(questionName).getByLabel(responseValue).click();
            }

            await page.getByRole("button", { name: "Submit" }).click();
            console.log(`Form submitted for ${name} (${email})`);
            await page.waitForTimeout(1000); // Menunggu agar form dapat disubmit dengan benar

        } catch (error) {
            console.error(`Error processing entry for ${name} (${email}):`, error);
            await page.screenshot({ path: `error-${name}-${email}.png` });
            console.log(`Screenshot saved for error with ${name} (${email})`);
        } finally {
            await context.close();
            console.log('Context closed');
        }
    };

    // Baca data dari file
    const data = fs.readFileSync('data.txt', 'utf-8');
    const entries = data.split('\n').filter(line => line.trim());
    console.log(`Loaded ${entries.length} entries from data.txt`);

    // Distribusi data ke dalam 7 hari
    const days = 7;
    const randomDataDistribution = Array.from({ length: days }, () => []);

    entries.forEach(entry => {
        const randomDay = Math.floor(Math.random() * days);
        randomDataDistribution[randomDay].push(entry);
    });

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let day = 0; day < days; day++) {
        const batch = randomDataDistribution[day];

        if (batch.length === 0) continue;

        console.log(`Day ${day + 1}: Processing ${batch.length} entries`);

        for (let i = 0; i < batch.length; i++) {
            const randomDelay = Math.random() * (3600 * 1000); // Delay antara 0 hingga 1 jam

            console.log(`Waiting for ${Math.floor(randomDelay / 1000)} seconds before next entry`);
            await sleep(randomDelay);

            await processBatch(batch[i], browser);
        }

        if (day < days - 1) {
            console.log(`Day ${day + 1} completed. Waiting until next day...`);
            await sleep(24 * 3600 * 1000); // Tunggu 24 jam sebelum melanjutkan hari berikutnya
        }
    }

    await browser.close();
    console.log('Browser closed');
})();
