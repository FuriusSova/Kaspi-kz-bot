process.setMaxListeners(0)
require("dotenv").config()
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const User = require("./db/userModel");
const Excel = require('exceljs');
const path = require('path');
const fs = require("fs");
const pdf = require('pdf-parse');

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
        const reviews = $(".item__rating-link span").text().slice($(".item__rating-link span").text().indexOf("(") + 1, $(".item__rating-link span").text().indexOf(")"));
        const rating = ($("span.rating").attr("class").slice($("span.rating").attr("class").indexOf("_") + 1)) / 2;
        let category;

        $('span[itemprop="name"]').each(async function (i, elem) {
            if (i == $('span[itemprop="name"]').length - 1) {
                category = $(this).text().slice(1);
            }
        });

        data.sellsFor14Days = sellsFor14Days;
        data.price = price * sellsFor14Days;
        data.reviews = reviews;
        data.category = category;
        data.rating = rating;

        return data;
    } catch (error) {
        console.log(error)
    }
};

const parseTop100 = async (url, flag, name, msg) => {
    try {
        let posts = [];
        let post = {};
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
                const rating = ($1("span.rating").attr("class").slice($1("span.rating").attr("class").indexOf("_") + 1)) / 2;
                const reviews = $1(".item__rating-link span").text().slice($1(".item__rating-link span").text().indexOf("(") + 1, $1(".item__rating-link span").text().indexOf(")"));
                const link = element;
                //let sellers = $1("tbody").children().length;
                let weight = "";
                let category;

                $1(".specifications-list__spec-term-text").each(async function (i, elem) {
                    if ($1(this).text() == "Вес" || $1(this).text() == "Средний вес" || $1(this).text() == "Вес на место") {
                        weight += ($1(this).parent().parent().children(".specifications-list__spec-definition").text());
                    }
                });

                $1('span[itemprop="name"]').each(async function (i, elem) {
                    if (i == $1('span[itemprop="name"]').length - 1) {
                        category = $1(this).text().slice(1);
                    }
                });

                post.name = nameOfProduct;
                post.articul = codeOfProduct;
                post.priceFor14Days = wageFor14Days;
                post.link = link;
                post.minPrice = price;
                post.weight = weight;
                post.rating = rating;
                post.reviews = reviews;
                post.category = category;

                posts.push(post);
            } catch (error) {
                console.log(error, ": " + element)
            }
        }
        await createExcel(name, msg, posts)
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

const createExcel = async (name, msg, posts) => {
    try {
        workbook = new Excel.Workbook();
        worksheet = workbook.addWorksheet('Отчёт');
        worksheet.columns = [
            { header: 'Название товара', key: 'name' },
            { header: 'Артикул товара', key: 'articul' },
            { header: 'Примерная выручка за 14 дней', key: 'priceFor14Days' },
            { header: 'Гиперссылка на товар', key: 'link' },
            { header: 'Минимальная продажная цена', key: 'minPrice' },
            { header: 'Вес', key: 'weight' },
            { header: 'Рейтинг', key: 'rating' },
            { header: 'Кол-во отзывов', key: 'reviews' },
            { header: 'Категория', key: 'category' },
            { header: 'Дата отчета', key: 'date' }
        ];
        worksheet.columns.forEach(column => {
            column.width = column.header.length + 5;
        })
        worksheet.getRow(1).font = { bold: true };
        posts.forEach((e, index) => {
            worksheet.addRow({ ...e, date: new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Almaty' }) });
        })
        await workbook.xlsx.writeFile(`./Reports/${name}Report${msg ? msg.chat.id : ""}.xlsx`)
    } catch (error) {
        console.log(error)
    }
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

const checkDemoFiles = async () => {
    const files = fs.readdirSync("./Reports");

    if (files.includes("demoBrandReport.xlsx") && files.includes("demoCategoryReport.xlsx") && files.includes("demoWordReport.xlsx")) {
        return true;
    } else {
        return false;
    }
}

const deleteFile = async (name, id) => {
    fs.unlinkSync(`./Reports/${name}Report${id}.xlsx`, err => {
        if (err) throw err; // не удалось удалить файл
        console.log('Файл успешно удалён');
    });
}

const filesSender = async (data, id) => {
    await bot.sendDocument(id, `./Reports/${data}Report${id}.xlsx`)
    await createFileOnGoogleDrive(`${data}Report${id}`, "1QCMk2iZtNJrH_1ufGSzKjtiSdvytf-0M");
    await deleteFile(data, id)
}

const showBalance = async (text, user) => {
    return {
        linksReports: (typeof text) == "number" ? user.subReports : `безлимит до ${text.slice(0, 2)}.${text.slice(3, 5)}.${text.slice(6, 10)}`,
        top100Ready: (typeof text) == "number" ? user.subReadyReportsTop100 : `безлимит до ${text.slice(0, 2)}.${text.slice(3, 5)}.${text.slice(6, 10)}`
    }
}

const checkCode = async (msg) => {
    try {
        User.findOne({ where: { chat_id: msg.chat.id } }).then(async (user) => {
            bot.downloadFile(msg.document.file_id, `./receipts`).then(async (data) => {
                fs.rename(`./${data}`, `./receipts/receipt${msg.chat.id}.pdf`, err => {
                    if (err) throw err;
                    pdf(`./receipts/receipt${msg.chat.id}.pdf`).then(async (data) => {
                        const arrCodes = JSON.parse(fs.readFileSync('./receiptId/codes.json'));
                        const code = data.text.slice(data.text.indexOf("Номер чека:") + 11, data.text.indexOf("\nОтправитель"))
                        const price = +data.text.slice(data.text.indexOf("Сумма:") + 6, data.text.indexOf("тг") - 1).replace(/\s/g, '')
                        const date = data.text.slice(data.text.indexOf("Дата/Время:") + 11, data.text.indexOf("\nКод эмиссии"))
                        const month = new Date(+date.slice(6, 10), +date.slice(3, 5) - 1, +date.slice(0, 2)).getMonth();
                        const day = new Date(+date.slice(6, 10), +date.slice(3, 5) - 1, +date.slice(0, 2)).getDay();
                        const year = new Date(+date.slice(6, 10), +date.slice(3, 5) - 1, +date.slice(0, 2)).getFullYear();

                        let flag = true;

                        for (let i = 0; i < arrCodes.length; i++) {
                            const element = arrCodes[i];
                            if (element.codeId == code) {
                                flag = false;
                                break
                            }
                        }

                        if (flag && new Date(Date.now()).getMonth() == month && new Date(Date.now()).getDay() == day && new Date(Date.now()).getFullYear() == year) {
                            arrCodes.push({
                                codeId: code
                            })
                            fs.writeFileSync('./receiptId/codes.json', `${JSON.stringify(arrCodes)}`);

                            if (price == 1490) {
                                user.subReports += 5;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Начислено 5 проверок");
                            } else if (price == 2490) {
                                user.subReports += 10;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Начислено 10 проверок");
                            } else if (price == 5990) {
                                user.subReportsIfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Начислен безлимит на месяц (проверки)");
                            } else if (price == 2990) {
                                user.subReadyReportsTop100 += 1;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Начислено 1шт Топ100 отчетов");
                            } else if (price == 9990) {
                                user.subReadyReportsTop100 += 5;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Начислено 5шт Топ100 отчетов");
                            } else if (price == 29990) {
                                user.subReportsIfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
                                user.subReportsTop100IfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Начислен безлимит на отчёты и проверки (1 месяц)");
                            }
                        } else {
                            if (!flag) await bot.sendMessage(msg.chat.id, "Чек с таким номером уже существует")
                            else if (new Date(Date.now()).getMonth() !== month || new Date(Date.now()).getDay() !== day || new Date(Date.now()).getFullYear() !== year) await bot.sendMessage(msg.chat.id, "Дата чека не совпадает с сегодняшней");
                        }

                        fs.unlinkSync(`./receipts/receipt${msg.chat.id}.pdf`, (err) => {
                            if (err) console.log(err);
                        })
                    }).catch((err) => console.log((err)))
                })
            })
        })
    } catch (error) {
        console.log(error);
    }
}

bot.on("document", async (msg) => {
    await checkCode(msg)
})

bot.on("message", async (msg) => {
    if (msg.text == "/start") {
        await bot.sendMessage(msg.chat.id, vars.greatingText, {
            "reply_markup": {
                "keyboard": [
                    ["Проверка ссылок"],
                    ["Топ100 по категориям", "Топ100 по брендам"],
                    ["Топ100 по ключевым словам", "Топ100 по цене"]
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
    if (!user) {
        await User.create({
            chat_id: msg.chat.id
        })
    }
    /////////////////////////////////////////////////////// TEST
    if (msg.text == "/test") {
        user.subReportsIfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
        user.subReportsTop100IfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
        user.save();
    }
    if (msg.text == "/test2") {
        user.subReports = 5;
        user.subReadyReportsTop100 = 5;
        user.save();
    }
    /////////////////////////////////////////////////////// TEST
    if (msg.text == "/help") {
        await bot.sendMessage(msg.chat.id, "Что Вас интересует?",
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboardQuestions
                }
            }
        );
    }
    if (msg.text == "/contactadmin") {
        await bot.sendMessage(msg.chat.id, vars.contactAdmin);
    }
    if (msg.text == "/balance") {
        let resp;
        if (user.subReportsIfUnlimited && user.subReportsIfUnlimited >= new Date(Date.now())) {
            resp = await showBalance(`${user.subReportsIfUnlimited.toLocaleString('en-GB', { timeZone: 'Asia/Almaty' })}`, user)
            await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во ТОП100 отчетов - ${resp.top100Ready}
            `);
        } else {
            if (user.subReports == 0) {
                resp = await showBalance(user.subReports, user);
                await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во ТОП100 готовых отчетов - ${resp.top100Ready}
            `,
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    });
            } else {
                resp = await showBalance(user.subReports, user);
                await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во ТОП100 готовых отчетов - ${resp.top100Ready}
            `);
            }
        }
    }
    if (msg.text == "/buysubscription") {
        await bot.sendMessage(msg.chat.id, vars.buySubscription,
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboardSubscription
                }
            }
        );
    }
    if (msg.text == "/declinesubscription") {
        user.subReports = 0;
        user.subReadyReportsTop100 = 0;
        if (user.subReportsIfUnlimited && user.subReportsIfUnlimited >= new Date(Date.now())) {
            user.subReportsIfUnlimited = null;
            await bot.sendMessage(msg.chat.id, "Подписка успешно отменена");
        } else if (user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited >= new Date(Date.now())) {
            user.subReportsTop100IfUnlimited = null
            await bot.sendMessage(msg.chat.id, "Подписка успешно отменена");
        } else {
            await bot.sendMessage(msg.chat.id, "Ваша подписка уже недействительна",
                {
                    reply_markup: {
                        inline_keyboard: vars.inlineKeyboardSubscription
                    }
                })
        }
        await user.save();
    }
    if (user.isOrderBrandReport) {
        user.isOrderBrandReport = false;
        await user.save();

        if (user.subReadyReportsTop100 == 0 || user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
            await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 отчетов по запросу. Оплатите за проверки для работы с ботом.",
                {
                    reply_markup: {
                        inline_keyboard: vars.inlineKeyboardSubscription
                    }
                });
            return;
        }

        if (user.subReadyReportsTop100 != 0) {
            user.subReadyReportsTop100 -= 1;
            await user.save();
        }
        await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
        const resp = await parseTop100(`https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3AmanufacturerName%3A${msg.text}`, "brand", "brand", msg);
        if (resp == -1) {
            await bot.sendMessage(msg.chat.id, "По переданному Вами бренду не найдено ни одного товара")
        } else {
            await filesSender(msg.text, msg.chat.id);
        }
    }
    if (user.isOrderKeyWordReport) {
        user.isOrderKeyWordReport = false;
        await user.save();

        if (user.subReadyReportsTop100 == 0 || user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
            await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 отчетов по запросу. Оплатите за проверки для работы с ботом.",
                {
                    reply_markup: {
                        inline_keyboard: vars.inlineKeyboardSubscription
                    }
                });
            return;
        }
        await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
        const resp = await parseTop100(`https://kaspi.kz/shop/search/?text=${msg.text}`, "word", "word", msg);
        if (resp == -1) {
            await bot.sendMessage(msg.chat.id, "По переданному Вами ключевому слову не найдено ни одного товара")
        } else {
            await filesSender(msg.text, msg.chat.id);
            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }
        }
    }
    if (RegExp.test(msg.text)) {
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        if (msg.text.includes("kaspi.kz/shop/c/")) {
            if (user.subReadyReportsTop100 != 0 || user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited >= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
                const response = await parseTop100(msg.text, "category", "category");
                if (response == -1) {
                    await bot.sendMessage(msg.chat.id, "По переданной Вами категории не найдено ни одного товара")
                } else {
                    await filesSender(msg.text, msg.chat.id);
                    if (user.subReadyReportsTop100 != 0) {
                        user.subReadyReportsTop100 -= 1;
                        user.save();
                    }
                }
            } else {
                await bot.sendMessage(msg.chat.id, "У Вас закончились проверки. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
            }
        } else if (user.subReports > 0 || user.subReportsIfUnlimited && user.subReportsIfUnlimited >= new Date(Date.now())) {
            if (msg.text.includes("kaspi.kz")) {
                await bot.sendMessage(msg.chat.id, "Запрос обрабатывается...")
                let data = await parseUrl(msg.text);
                if (user.subReports > 0) {
                    user.subReports -= 1;
                    user.save();
                }
                await bot.sendMessage(msg.chat.id, `
Top100Kaspi_bot - аналитика продаж на Каспи 

Дата запроса: 16.06.2022
••••••••••••••••••••••••••••••••••••••••
🛍 За 14 дней ≈ ${data.sellsFor14Days} продаж(и)
••••••••••••••••••••••••••••••••••••••••
📆 Кол-во продаж в день ≈ ${Math.round(data.sellsFor14Days / 14)} шт.
••••••••••••••••••••••••••••••••••••••••
💳 Примерная выручка ≈ ${data.price} ₸
••••••••••••••••••••••••••••••••••••••••
👍🏻 Рейтинг товара = ${data.rating}
••••••••••••••••••••••••••••••••••••••••
✍️ ${data.reviews}
••••••••••••••••••••••••••••••••••••••••
`);
            } else {
                bot.sendMessage(msg.chat.id, "Неверная ссылка")
            }
        } else {
            await bot.sendMessage(msg.chat.id, "У Вас закончились проверки. Оплатите за проверки для работы с ботом.",
                {
                    reply_markup: {
                        inline_keyboard: vars.inlineKeyboardSubscription
                    }
                })
        }
    }
    if (msg.text == "Проверка ссылок") {
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };

        if (user.subReportsIfUnlimited && user.subReportsIfUnlimited >= new Date(Date.now())) {
            const text = user.subReportsIfUnlimited.toLocaleString('en-GB', { timeZone: 'Asia/Almaty' });
            await bot.sendMessage(msg.chat.id, `Подписка действует до: ${text.slice(0, 2)}.${text.slice(3, 5)}.${text.slice(6, 10)}`);
        } else {
            if (user.subReports == 0) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились проверки. Оплатите за проверки для работы с ботом.")
            } else {
                await bot.sendMessage(msg.chat.id, `У Вас осталось ${user.subReports} бесплатных проверок! ${vars.greatingText}`);
            }
        }
    };
    if (msg.text == "Топ100 по категориям") {
        await bot.sendMessage(msg.chat.id, "Выберете категорию для создания отчета:",
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboard
                }
            }
        );
        await bot.sendMessage(msg.chat.id, vars.categoryText)
    };
    if (msg.text == "Топ100 по брендам") {
        bot.sendMessage(msg.chat.id, vars.brandText,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Пробный отчет по бренду "Apple"',
                                callback_data: "demoBrand"
                            }
                        ]
                    ]
                }
            }
        );
        user.isOrderBrandReport = true;
        await user.save();
    };
    if (msg.text == "Топ100 по цене") {
        await bot.sendMessage(msg.chat.id, "Выберете категорию:",
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboardPrice
                }
            }
        );
    };
    if (msg.text == "Топ100 по ключевым словам") {
        bot.sendMessage(msg.chat.id, vars.keyWordText,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Пробный отчет по ключевому слову "смартфон"',
                                callback_data: "demoWord"
                            }
                        ]
                    ]
                }
            }
        );
        user.isOrderKeyWordReport = true;
        await user.save();
    };
})

bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const msg = callbackQuery.message;
    const user = await User.findOne({ where: { chat_id: msg.chat.id } });

    try {
        if (data == "furniture") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/furniture/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "home") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/home/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "clothes") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/fashion/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "jewellery") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/jewelry%20and%20bijouterie/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "vehicle") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/car%20goods/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "building") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/construction%20and%20repair/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "health") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/beauty%20care/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "entertainment") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/leisure/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "sport") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/sports%20and%20outdoors/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "shoes") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/shoes/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "children") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/child%20goods/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "trinkets") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/fashion%20accessories/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "pharmacy") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/pharmacy/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "technique") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/home%20equipment/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "computers") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/computers/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "grocery") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/food/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "gadgets") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/smartphones%20and%20gadgets/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "video") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/tv_audio/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "animals") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/pet%20goods/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "office") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/office%20and%20school%20supplies/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "gifts") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/gifts%20and%20party%20supplies/all/", "category", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "upTo10000") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A%D0%B4%D0%BE+10+000+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "from10000to49999") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A10+000+-+49+999+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "from50000to99999") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A50+000+-+99+999+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "from100000to149999") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A100+000+-+149+999+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "from150000to199999") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A150+000+-+199+999+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "from200000to499999") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A200+000+-+499+999+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "moreThan500000") {
            if (user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited || user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
                await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    })
                await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
                return;
            }

            if (user.subReadyReportsTop100 != 0) {
                user.subReadyReportsTop100 -= 1;
                await user.save();
            }

            await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (5-10 минут)")
            await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5+500+000+%D1%82", "price", data, msg);
            await filesSender(data, msg.chat.id)
        } else if (data == "demoCategory") {
            await bot.sendDocument(msg.chat.id, "./Reports/demoCategoryReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "demoBrand") {
            user.isOrderBrandReport = false;
            await user.save();
            await bot.sendDocument(msg.chat.id, "./Reports/demoBrandReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "demoWord") {
            user.isOrderKeyWordReport = false;
            await user.save();
            await bot.sendDocument(msg.chat.id, "./Reports/demoWordReport.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "quest1") {
            await bot.sendMessage(msg.chat.id, vars.answerQuest1)
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "quest2") {
            await bot.sendMessage(msg.chat.id, vars.answerQuest2)
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "quest3") {
            await bot.sendMessage(msg.chat.id, vars.answerQuest3)
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "quest4") {
            await bot.sendMessage(msg.chat.id, vars.answerQuest4)
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "quest5") {
            await bot.sendMessage(msg.chat.id, vars.answerQuest5)
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "quest6") {
            await bot.sendMessage(msg.chat.id, vars.answerQuest6)
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "chechPay") {
            //user.subscriptionChoosed = true;
            //await user.save();
            await bot.sendMessage(msg.chat.id, "Вышлите пожалуйста квитанцию об оплате боту на проверку")
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        }
    } catch (error) {
        console.log(error)
        await bot.sendMessage(msg.chat.id, "Произошла ошибка (отчет может быть еще не готов)")
    }
});

/*
(async function () {
    if (!await checkDemoFiles()) {
        await parseTop100("https://kaspi.kz/shop/c/smartphones%20and%20gadgets/all/", "category", "demoCategory");

        await parseTop100(`https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3AmanufacturerName%3AApple`, "brand", "demoBrand");

        await parseTop100(`https://kaspi.kz/shop/search/?text=смартфон`, "word", "demoWord");
    }
}())
*/