process.setMaxListeners(0)
require("dotenv").config()
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const User = require("./db/userModel");
const Excel = require('exceljs');
const path = require('path');
const fs = require("fs");
const cron = require('node-cron');

const puppeteer = require('puppeteer');
const chr = require("cheerio")
const { google } = require("googleapis")
let $;

const vars = require("./vars");
const KEY_FILE_PATH = path.join(__dirname, 'key.json');
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES
});
let RegExp = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/;

const LAUNCH_PUPPETEER_OPTS = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
    ]
};

const PAGE_PUPPETEER_OPTS = {
    networkIdle2Timeout: 5000,
    waitUntil: 'networkidle2',
    timeout: 3000000
};

const getHTML = async (url) => {
    const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
    const page = await browser.newPage();
    await page.goto(url, PAGE_PUPPETEER_OPTS);
    const content = await page.content();
    await page.close(); // MB UBRAT
    await browser.close();
    return chr.load(content);
};

const parseUrl = async (url) => {
    try {
        $ = await getHTML(url);
        let data = {};
        const dataScript = ($("#offers-list").children()[0].children[0].data).slice(($("#offers-list").children()[0].children[0].data).indexOf("Orders"));
        const sellsFor14Days = Number(dataScript.slice(dataScript.indexOf("=") + 1, dataScript.indexOf(";")));
        const priceStr = ($("tbody tr")[0].children[3].children[0].children[0].data).slice(0, ($("tbody tr")[0].children[3].children[0].children[0].data).indexOf("₸") - 1);
        const price = Number(priceStr.slice(0, priceStr.indexOf("\xa0")) + priceStr.slice(priceStr.indexOf("\xa0") + 1));
        data.sellsFor14Days = sellsFor14Days;
        data.price = price * sellsFor14Days;

        return data;
    } catch (error) {
        console.log(error)
    }
};

let posts = [];
let post = {};

const parseTop100 = async (url, flag) => {
    try {
        let $1;
        let arrOfLinks = [];
        let sign;


        if (flag == "category") {
            sign = "?"
        } else if (flag == "brand" || flag == "price" || flag == "word") {
            sign = "&"
        }

        for (let i = 1; i <= 9; i++) {
            console.log(`${url}${sign}page=${i}`);
            $ = await getHTML(`${url}${sign}page=${i}`);
            if (!$(".item-card__name-link").attr('href')) return -1;
            $(".item-card__name-link").each(async function (index, elem) {
                if (i !== 9) {
                    arrOfLinks.push($(this).attr('href'));
                } else {
                    if (index < 4) {
                        arrOfLinks.push($(this).attr('href'));
                    }
                }
            });
        }

        console.log(arrOfLinks);
        for (const element of arrOfLinks) {
            console.log(element)
            post = {};
            try {
                $1 = await getHTML(element);
                const dataScript = ($1("#offers-list").children()[0].children[0].data).slice(($1("#offers-list").children()[0].children[0].data).indexOf("Orders"));
                const sellsFor14Days = Number(dataScript.slice(dataScript.indexOf("=") + 1, dataScript.indexOf(";")));
                const priceStr = $1(".item__price-once").text().slice(0, ($1(".item__price-once").text().indexOf("₸") - 1));

                const price = Number(priceStr.slice(0, priceStr.indexOf("\xa0")) + priceStr.slice(priceStr.indexOf("\xa0") + 1));
                const wageFor14Days = sellsFor14Days * price;
                const codeOfProduct = ($1(".pp-map").attr("data-map-req")).slice(($1(".pp-map").attr("data-map-req")).indexOf("/p/") + 3, ($1(".pp-map").attr("data-map-req")).indexOf("/m"));
                const nameOfProduct = $1(".item__heading").text();
                const link = element;
                //let sellers = $1("tbody").children().length;
                let weight = "";

                $1(".specifications-list__spec-term-text").each(async function (i, elem) {
                    if ($1(this).text() == "Вес" || $1(this).text() == "Средний вес" || $1(this).text() == "Вес на место") {
                        weight += ($1(this).parent().parent().children(".specifications-list__spec-definition").text());
                    }
                });

                post.name = nameOfProduct;
                post.articul = codeOfProduct;
                post.priceFor14Days = wageFor14Days;
                post.link = link;
                post.minPrice = price;
                post.weight = weight;

                posts.push(post);
            } catch (error) {
                console.log(error, ": " + element)
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const checkMember = async (msg, id) => {
    const member = await bot.getChatMember("@top100kaspi", msg.chat.id);
    if (member.status != "member" && member.status != "administrator" && member.status != "creator") {
        return false;
    } else {
        return true;
    }
}

let workbook;
let worksheet;

const createExcel = async (name, msg) => {
    workbook = new Excel.Workbook();
    worksheet = workbook.addWorksheet('Отчёт');
    worksheet.columns = [
        { header: 'Название товара', key: 'name' },
        { header: 'Артикул товара', key: 'articul' },
        { header: 'Примерная выручка за 14 дней', key: 'priceFor14Days' },
        { header: 'Гиперссылка на товар', key: 'link' },
        { header: 'Минимальная продажная цена', key: 'minPrice' },
        { header: 'Вес', key: 'weight' },
        { header: 'Дата отчета', key: 'date' }
    ];
    worksheet.columns.forEach(column => {
        column.width = column.header.length + 5;
    })
    worksheet.getRow(1).font = { bold: true };
    posts.forEach((e, index) => {
        worksheet.addRow({ ...e, date: new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Europe/Kiev' }) });
    })
    await workbook.xlsx.writeFile(`./Reports/${name}Report${msg ? msg.chat.id : ""}.xlsx`)
}

const createFileOnGoogleDrive = async (name, folder) => {
    const driveService = google.drive({ version: "v3", auth });
    let fileMetaData = {
        "name": "Report.xlsx",
        "parents": [folder]
    }
    let media = {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        body: fs.createReadStream(`./Reports/${name}.xlsx`)
    }
    let response = await driveService.files.create({
        resource: fileMetaData,
        media: media,
        fields: "id"
    })

    if (response.status == 200) {
        console.log(response.data.id);
    } else {
        console.log(response);
    }
}

const allParsing = async () => {
    try {
        await parseTop100("https://kaspi.kz/shop/c/furniture/all/", "category");
        await createExcel("furniture");

        await parseTop100("https://kaspi.kz/shop/c/home/all/", "category");
        await createExcel("home");

        await parseTop100("https://kaspi.kz/shop/c/fashion/all/", "category");
        await createExcel("clothes");

        await parseTop100("https://kaspi.kz/shop/c/jewelry%20and%20bijouterie/all/", "category");
        await createExcel("jewellery");

        await parseTop100("https://kaspi.kz/shop/c/car%20goods/all/", "category");
        await createExcel("vehicles");

        await parseTop100("https://kaspi.kz/shop/c/construction%20and%20repair/all/", "category");
        await createExcel("building");

        await parseTop100("https://kaspi.kz/shop/c/beauty%20care/all/", "category");
        await createExcel("health");

        await parseTop100("https://kaspi.kz/shop/c/leisure/all/", "category");
        await createExcel("entertainment");

        await parseTop100("https://kaspi.kz/shop/c/sports%20and%20outdoors/all/", "category");
        await createExcel("sport");

        await parseTop100("https://kaspi.kz/shop/c/shoes/all/", "category");
        await createExcel("shoes");

        await parseTop100("https://kaspi.kz/shop/c/child%20goods/all/", "category");
        await createExcel("children");

        await parseTop100("https://kaspi.kz/shop/c/fashion%20accessories/all/", "category");
        await createExcel("trinkets");

        await parseTop100("https://kaspi.kz/shop/c/pharmacy/all/", "category");
        await createExcel("pharmacy");

        await parseTop100("https://kaspi.kz/shop/c/home%20equipment/all/", "category");
        await createExcel("technique");

        await parseTop100("https://kaspi.kz/shop/c/computers/all/", "category");
        await createExcel("computers");

        await parseTop100("https://kaspi.kz/shop/c/food/all/", "category");
        await createExcel("grocery");

        await parseTop100("https://kaspi.kz/shop/c/smartphones%20and%20gadgets/all/", "category");
        await createExcel("gadgets");

        await parseTop100("https://kaspi.kz/shop/c/tv_audio/all/", "category");
        await createExcel("video");

        await parseTop100("https://kaspi.kz/shop/c/pet%20goods/all/", "category");
        await createExcel("animals");

        await parseTop100("https://kaspi.kz/shop/c/office%20and%20school%20supplies/all/", "category");
        await createExcel("office");

        await parseTop100("https://kaspi.kz/shop/c/gifts%20and%20party%20supplies/all/", "category");
        await createExcel("gifts");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A%D0%B4%D0%BE+10+000+%D1%82", "price");
        await createExcel("upTo10000");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A10+000+-+49+999+%D1%82", "price");
        await createExcel("from10000to49999");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A50+000+-+99+999+%D1%82", "price");
        await createExcel("from50000to99999");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A100+000+-+149+999+%D1%82", "price");
        await createExcel("from100000to149999");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A150+000+-+199+999+%D1%82", "price");
        await createExcel("from150000to199999");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A200+000+-+499+999+%D1%82", "price");
        await createExcel("from200000to499999");

        await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5+500+000+%D1%82", "price");
        await createExcel("moreThan500000");
    } catch (error) {
        console.log(error)
    }
}

bot.on("message", async (msg) => {
    if (msg.text == "/start") {
        await bot.sendMessage(msg.chat.id, vars.greatingText, {
            "reply_markup": {
                "keyboard": [
                    ["Проверка ссылок"],
                    ["Топ по категориям", "Заказать отчет Топ100 по бренду"],
                    ["Заказать отчет Топ100 по ключевому слову", "Топ по цене"],
                    //["Общий Топ100 (отчет за 14 дней)", "Общий Топ200 (отчет за 14 дней)"],
                    //["Общий Топ500 (отчет за 14 дней)", "Общий Топ1000 (отчет за 14 дней)"]
                ]
            }
        });
        const createdUser = await User.findOne({ where: { chat_id: msg.chat.id } });
        if (!createdUser) {
            const newUser = await User.create({
                chat_id: msg.chat.id
            })
        }
    }
    const user = await User.findOne({ where: { chat_id: msg.chat.id } });
    if (user.isOrderBrandReport) {
        user.isOrderBrandReport = false;
        await user.save();

        await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
        const resp = await parseTop100(`https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3AmanufacturerName%3A${msg.text}`, "brand");
        if (resp == -1) {
            await bot.sendMessage(msg.chat.id, "По переданному Вами бренду не найдено ни одного товара")
        } else {
            createExcel(msg.text, msg).then(() => {
                bot.sendDocument(msg.chat.id, `./Reports/${msg.text}Report${msg.chat.id}.xlsx`).then(() => {
                    createFileOnGoogleDrive(`${msg.text}Report${msg.chat.id}`, "1o5HqHeqGTUZWwHa9CCbfa1jIuxKp23II").then(() => {
                        fs.unlinkSync(`./Reports/${msg.text}Report${msg.chat.id}.xlsx`, err => {
                            if (err) throw err; // не удалось удалить файл
                            console.log('Файл успешно удалён');
                        });
                    })
                })
            })
        }
    }
    if (user.isOrderKeyWordReport) {
        user.isOrderKeyWordReport = false;
        await user.save();

        await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
        const resp = await parseTop100(`https://kaspi.kz/shop/search/?text=${msg.text}`, "word");
        if (resp == -1) {
            await bot.sendMessage(msg.chat.id, "По переданному Вами бренду не найдено ни одного товара")
        } else {
            createExcel(msg.text, msg).then(() => {
                bot.sendDocument(msg.chat.id, `./Reports/${msg.text}Report${msg.chat.id}.xlsx`).then(() => {
                    createFileOnGoogleDrive(`${msg.text}Report${msg.chat.id}`, "1gsqkVAzdjtLQS-jhb5eFlwnAdKg8v-12").then(() => {
                        fs.unlinkSync(`./Reports/${msg.text}Report${msg.chat.id}.xlsx`, err => {
                            if (err) throw err; // не удалось удалить файл
                            console.log('Файл успешно удалён');
                        });
                    })
                })
            })
        }
    }
    if (RegExp.test(msg.text)) {
        if (msg.text.includes("kaspi.kz")) {
            await bot.sendMessage(msg.chat.id, "Запрос обрабатывается...")
            let data = await parseUrl(msg.text);
            await bot.sendMessage(msg.chat.id, `Кол-во продаж за 14 дней ≈ ${data.sellsFor14Days}
Выручка за 14 дней ≈ ${data.price} ₸`)
        } else {
            bot.sendMessage(msg.chat.id, "Неверная ссылка")
        }
    }
    if (msg.text == "Проверка ссылок") {
        /* REMOVE COMENTARY
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        */
        await bot.sendMessage(msg.chat.id, "Парсинг начался")
        await allParsing();
        await bot.sendMessage(msg.chat.id, "Парсинг закончился")
    };
    if (msg.text == "Топ по категориям") {
        /* REMOVE COMENTARY
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        */
        await bot.sendMessage(msg.chat.id, "Выберете категорию:",
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboard
                }
            }
        );
    };
    if (msg.text == "Заказать отчет Топ100 по бренду") {
        /* REMOVE COMENTARY
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        */
        bot.sendMessage(msg.chat.id, vars.brandText);
        user.isOrderBrandReport = true;
        await user.save();
    };
    if (msg.text == "Топ по цене") {
        /* REMOVE COMENTARY
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        */
        await bot.sendMessage(msg.chat.id, "Выберете категорию:",
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboardPrice
                }
            }
        );
    };
    if (msg.text == "Заказать отчет Топ100 по ключевому слову") {
        /* REMOVE COMENTARY
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        */
        bot.sendMessage(msg.chat.id, vars.keyWordText);
        user.isOrderKeyWordReport = true;
        await user.save();
    };
})

bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const msg = callbackQuery.message;

    try {
        if (data == "furniture") {
            await bot.sendDocument(msg.chat.id, "./Reports/furnitureReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("furnitureReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "home") {
            await bot.sendDocument(msg.chat.id, "./Reports/homeReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("homeReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "clothes") {
            await bot.sendDocument(msg.chat.id, "./Reports/clothesReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("clothesReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "jewellery") {
            await bot.sendDocument(msg.chat.id, "./Reports/jewelleryReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("jewelleryReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "vehicle") {
            await bot.sendDocument(msg.chat.id, "./Reports/vehiclesReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("vehiclesReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "building") {
            await bot.sendDocument(msg.chat.id, "./Reports/buildingReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("buildingReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "health") {
            await bot.sendDocument(msg.chat.id, "./Reports/healthReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("healthReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "entertainment") {
            await bot.sendDocument(msg.chat.id, "./Reports/entertainmentReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("entertainmentReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "sport") {
            await bot.sendDocument(msg.chat.id, "./Reports/sportReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("sportReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "shoes") {
            await bot.sendDocument(msg.chat.id, "./Reports/shoesReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("shoesReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "children") {
            await bot.sendDocument(msg.chat.id, "./Reports/childrenReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("childrenReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "trinkets") {
            await bot.sendDocument(msg.chat.id, "./Reports/trinketsReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("trinketsReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "pharmacy") {
            await bot.sendDocument(msg.chat.id, "./Reports/pharmacyReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("pharmacyReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "technique") {
            await bot.sendDocument(msg.chat.id, "./Reports/techniqueReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("techniqueReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "computers") {
            await bot.sendDocument(msg.chat.id, "./Reports/computersReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("computersReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "grocery") {
            await bot.sendDocument(msg.chat.id, "./Reports/groceryReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("groceryReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "gadgets") {
            await bot.sendDocument(msg.chat.id, "./Reports/gadgetsReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("gadgetsReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "video") {
            await bot.sendDocument(msg.chat.id, "./Reports/videoReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("videoReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "animals") {
            await bot.sendDocument(msg.chat.id, "./Reports/animalsReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("animalsReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "office") {
            await bot.sendDocument(msg.chat.id, "./Reports/officeReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("officeReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "gifts") {
            await bot.sendDocument(msg.chat.id, "./Reports/giftsReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
            await createFileOnGoogleDrive("giftsReport", "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
        } else if (data == "upTo10000") {
            await bot.sendDocument(msg.chat.id, "./Reports/upTo10000Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        } else if (data == "from10000to49999") {
            await bot.sendDocument(msg.chat.id, "./Reports/from10000to49999Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        } else if (data == "from50000to99999") {
            await bot.sendDocument(msg.chat.id, "./Reports/from50000to99999Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        } else if (data == "from100000to149999") {
            await bot.sendDocument(msg.chat.id, "./Reports/from100000to149999Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        } else if (data == "from150000to199999") {
            await bot.sendDocument(msg.chat.id, "./Reports/from150000to199999Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        } else if (data == "from200000to499999") {
            await bot.sendDocument(msg.chat.id, "./Reports/from200000to499999Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        } else if (data == "moreThan500000") {
            await bot.sendDocument(msg.chat.id, "./Reports/moreThan500000Report.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id, text: "Готово" });
        }
    } catch (error) {
        console.log(error)
        await bot.sendMessage(msg.chat.id, "Произошла ошибка")
    }
});

/*
cron.schedule(`* * * * *`, async () => {
    console.log("Hello");
}, {
    scheduled: true,
    timezone: "Europe/Kiev"
});
*/