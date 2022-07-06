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
    page.setDefaultNavigationTimeout(0);
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

        const date = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Almaty' }).slice(0, 10);
        const month = date.slice(3, 5);
        const day = date.slice(0, 2);
        const year = date.slice(6, 10);

        const dataScript = ($("#offers-list").children()[0].children[0].data).slice(($("#offers-list").children()[0].children[0].data).indexOf("Orders"));
        const sellsFor14Days = Number(dataScript.slice(dataScript.indexOf("=") + 1, dataScript.indexOf(";")));
        const priceStr = ($("tbody tr")[0].children[3].children[0].children[0].data).slice(0, ($("tbody tr")[0].children[3].children[0].children[0].data).indexOf("₸") - 1);
        const price = priceStr.replaceAll("\xa0", "");
        const reviews = $(".item__rating-link span").text().slice($(".item__rating-link span").text().indexOf("(") + 1, $(".item__rating-link span").text().indexOf(")"));
        const rating = ($("span.rating").attr("class").slice($("span.rating").attr("class").indexOf("_") + 1)) / 2;
        let category;
        let todayDate = `${day}.${month}.${year}`;

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
        data.date = todayDate;

        return data;
    } catch (error) {
        console.log(error)
        return "Данная ссылка некорректная, пожалуйста скопируйте и вставьте всю ссылку с kaspi.kz"
    }
};

const parseTop100 = async (url, flag, name, msg, repData) => {
    try {
        let posts = [];
        let post = {};
        let $1;
        let arrOfLinks = [];
        let sign;
        let stopFlag = false;


        if (flag == "category") {
            sign = "?"
        } else if (flag == "brand" || flag == "price" || flag == "word") {
            sign = "&"
        }
        /*
        $ = await getHTML(`${url}${sign}page=1`);
        if (!$(".item-card__name-link").attr('href')) return -1;
        $(".item-card__name-link").each(async function (index, elem) {
            arrOfLinks.push($(this).attr('href'));
        });
        */
        for (let i = 1; i <= 9; i++) {
            stopFlag = true;
            console.log(`${url}${sign}page=${i}`);
            $ = await getHTML(`${url}${sign}page=${i}`);
            if (!$(".item-card__name-link").attr('href') && i == 1) {
                return -1;
            } else if (!$(".item-card__name-link").attr('href') && i > 1) {
                break;
            }
            $(".item-card__name-link").each(async function (index, elem) {
                if (i !== 9) {
                    if (arrOfLinks.includes($(this).attr('href')) && i == 2) {
                        arrOfLinks = [];
                        sign = sign == "&" ? "?" : "&";
                        i = 0;
                        stopFlag = false;
                    } else if (arrOfLinks.includes($(this).attr('href')) && i > 2) {
                        i = 10;
                        return false;
                    } else if (stopFlag) {
                        arrOfLinks.push($(this).attr('href'));
                    }
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

                const price = priceStr.replaceAll("\xa0", "");
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
                post.sellsFor14Days = sellsFor14Days;

                posts.push(post);
            } catch (error) {
                console.log(error, ": " + element)
            }
        }
        await createExcel(name, msg, posts, repData)
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

const createExcel = async (name, msg, posts, repData) => {
    try {
        let items = posts.sort((a, b) => {
            if (a["sellsFor14Days"] > b["sellsFor14Days"]) return -1;
        })
        let lengthCell = 0;
        let lengthCellCategory = 0;
        const date = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Almaty' }).slice(0, 10);
        const month = date.slice(3, 5);
        const day = date.slice(0, 2);
        const year = date.slice(6, 10);
        workbook = new Excel.Workbook();
        worksheet = workbook.addWorksheet('Отчёт');
        worksheet.mergeCells('A1', 'O1');
        worksheet.mergeCells('A2', 'O2');
        worksheet.getCell('A1').value = `             ${new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Almaty' })}  -  Top100Kaspi_bot  -  Внимание! Приведённые данные по продажам примерные, никаких персональных данных бот не собирает и не предоставляет.`;
        worksheet.getCell('A2').value = `             Отчет по ${repData.rep} : ${repData.repReq}`;
        worksheet.getRow(3).values = ['Название товара', 'Код товара', 'Примерная выручка за 14 дней', 'Кол-во продаж', 'Минимальная продажная цена', 'Вес', 'Рейтинг', 'Кол-во отзывов', 'Категория', 'Ссылка на товар'];
        const imageId = workbook.addImage({
            filename: './logo.jpg',
            extension: 'jpeg',
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 40, height: 40 }
        });
        worksheet.columns = [
            { key: 'name' },
            { key: 'articul' },
            { key: 'priceFor14Days' },
            { key: 'sellsFor14Days' },
            { key: 'minPrice' },
            { key: 'weight' },
            { key: 'rating' },
            { key: 'reviews' },
            { key: 'category' },
            { key: 'link' }
        ];
        items.forEach(element => {
            if (lengthCell < element.name.length) lengthCell = element.name.length;
            if (lengthCellCategory < element.category.length) lengthCellCategory = element.category.length;
        });
        worksheet.columns.forEach((column, i) => {
            if (i == 0) column.width = lengthCell
            else if (i == 8) column.width = lengthCellCategory + 5
            else column.width = worksheet.getRow(3).values[i].length + 5;
        })
        worksheet.getRow(3).font = { bold: true };
        worksheet.getColumn(3).numFmt = '#,###'; // '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)'
        items.forEach((e, index) => {
            worksheet.addRow({ ...e });
        })
        await workbook.xlsx.writeFile(`./Reports/top100kaspi_bot-${name}Report_${name == "demoCategory" || name == "demoBrand" || name == "demoWord" ? "" : day + month + year}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

const createFileOnGoogleDrive = async (name, folder) => {
    const driveService = google.drive({ version: "v3", auth });
    let fileMetaData = {
        "name": `${name}.xlsx`,
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

    if (files.includes("top100kaspi_bot-demoBrandReport_.xlsx") && files.includes("top100kaspi_bot-demoCategoryReport_.xlsx") && files.includes("top100kaspi_bot-demoWordReport_.xlsx")) {
        return true;
    } else {
        return false;
    }
}

const deleteFile = async (name, date) => {
    fs.unlinkSync(`./Reports/top100kaspi_bot-${name}Report_${date}.xlsx`, err => {
        if (err) throw err; // не удалось удалить файл
        console.log('Файл успешно удалён');
    });
}

const filesSender = async (data, id, folder) => {
    const user = await User.findOne({ where: { chat_id: id } });
    try {
        const date = new Date(Date.now()).toLocaleString('en-GB', { timeZone: 'Asia/Almaty' }).slice(0, 10);
        const month = date.slice(3, 5);
        const day = date.slice(0, 2);
        const year = date.slice(6, 10);
        await bot.sendDocument(id, `./Reports/top100kaspi_bot-${data}Report_${day + month + year}.xlsx`)
        await createFileOnGoogleDrive(`top100kaspi_bot-${data}Report_${day + month + year}`, folder);
        await deleteFile(data, day + month + year)
        user.isOrderReport = false;
        await user.save();
    } catch (error) {
        console.log(error)
        user.isOrderReport = false;
        await user.save();
    }
}

const showBalance = async (text, text1, user) => {
    return {
        linksReports: (typeof text) == "number" ? user.subReports : `безлимит до ${text.slice(0, 2)}.${text.slice(3, 5)}.${text.slice(6, 10)}`,
        top100Ready: (typeof text1) == "number" ? user.subReadyReportsTop100 : `безлимит до ${text1.slice(0, 2)}.${text1.slice(3, 5)}.${text1.slice(6, 10)}`
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

                            if (price == 990) {
                                user.subReports += 5;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислено 5 проверок! Проверка баланса по команде /balance");
                            } else if (price == 1490) {
                                user.subReports += 10;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислено 10 проверок! Проверка баланса по команде /balance");
                            } else if (price == 4990) {
                                user.subReportsIfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислен безлимит на месяц (проверки)! Проверка баланса по команде /balance");
                            } else if (price == 2990) {
                                user.subReadyReportsTop100 += 1;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислен 1 отчёт! Проверка баланса по команде /balance");
                            } else if (price == 9990) {
                                user.subReadyReportsTop100 += 5;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислено 5 отчётов! Проверка баланса по команде /balance");
                            } else if (price == 14990) {
                                user.subReadyReportsTop100 += 10;
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислено 5 отчётов! Проверка баланса по команде /balance");
                            } else if (price == 29990) {
                                user.subReportsIfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
                                user.subReportsTop100IfUnlimited = new Date(new Date(Date.now()).setMonth(new Date(Date.now()).getMonth() + 1));
                                await user.save();
                                await bot.sendMessage(msg.chat.id, "Поздравляем, Вам начислен безлимит на отчёты и проверки! Проверка баланса по команде /balance");
                            }
                        } else {
                            if (!flag) await bot.sendMessage(msg.chat.id, "Данный чек уже есть в базе, пожалуйста загрузите для проверки новый чек или свяжитесь с администратором /contactadmin")
                            else if (new Date(Date.now()).getMonth() !== month || new Date(Date.now()).getDay() !== day || new Date(Date.now()).getFullYear() !== year) await bot.sendMessage(msg.chat.id, "К сожалению подтвердить оплату не удалось, пожалуйста отправьте квитанцию об оплате в формате pdf или свяжитесь с администратором по команде /contactadmin");
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

const categoriesFunc = async (id, user) => {
    if ((user.subReadyReportsTop100 == 0 && !user.subReportsTop100IfUnlimited) || (user.subReadyReportsTop100 == 0 && user.subReportsTop100IfUnlimited <= new Date(Date.now()))) {
        await bot.sendMessage(id, "У Вас закончились запросы на топ 100 готовых отчётов. Оплатите за проверки для работы с ботом.",
            {
                reply_markup: {
                    inline_keyboard: vars.inlineKeyboardSubscription
                }
            })
        return false;
    }
    if (user.isOrderReport) {
        await bot.sendMessage(id, "Запрошенный ранее отчёт еще не сформирован, пожалуйста подождите");
        return false;
    }

    user.subReadyReportsTop100 -= 1;
    user.isOrderReport = true;
    await user.save();

    await bot.sendMessage(id, "Отчёт формируется, пожалуйста подождите (10-15 минут)")
    return true;
}

bot.onText(/\/addReports (.+)/, async (msg, match) => {
    try {
        const user = await User.findOne({ where: { username: msg.chat.username } });
        if (user.username == "maximseller" || user.username == "Mr_Li13" || user.username == "Furius16") {
            const resp = match[1];
            console.log(match[1].slice(0, match[1].indexOf(":")), match[1].slice(match[1].indexOf(":") + 1));
            const findUser = await User.findOne({ where: { username: match[1].slice(0, match[1].indexOf(":")) } });
            if (findUser) {
                findUser.subReports += Number(match[1].slice(match[1].indexOf(":") + 1));
                await findUser.save();
                await bot.sendMessage(msg.chat.id, `Кол-во проверок пользователя ${match[1].slice(0, match[1].indexOf(":"))} пополнено на ${Number(match[1].slice(match[1].indexOf(":") + 1))}`)
            } else {
                await bot.sendMessage(msg.chat.id, "Пользователь не найден");
            }
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, "Вы не правильно указали данные");
        console.log(error)
    }
});

bot.onText(/\/addReportsUnlimited (.+)/, async (msg, match) => {
    try {
        const user = await User.findOne({ where: { username: msg.chat.username } });
        if (user.username == "maximseller" || user.username == "Mr_Li13" || user.username == "Furius16") {
            const resp = match[1];
            console.log(match[1].slice(0, match[1].indexOf(":")), match[1].slice(match[1].indexOf(":") + 1));
            const findUser = await User.findOne({ where: { username: match[1].slice(0, match[1].indexOf(":")) } });
            if (findUser) {
                const date = match[1].slice(match[1].indexOf(":") + 1);
                console.log(`${date.slice(0, 2)}.${date.slice(3, 5)}.${date.slice(6, 10)}`, new Date(date.slice(6, 10), date.slice(3, 5) - 1, date.slice(0, 2)))
                findUser.subReportsIfUnlimited = new Date(date.slice(6, 10), date.slice(3, 5) - 1, date.slice(0, 2));
                await findUser.save();
                await bot.sendMessage(msg.chat.id, `Подписка оформлена пользователю ${match[1].slice(0, match[1].indexOf(":"))} до ${date.slice(0, 2)}.${date.slice(3, 5)}.${date.slice(6, 10)}`)
            } else {
                await bot.sendMessage(msg.chat.id, "Пользователь не найден");
            }
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, "Вы не правильно указали данные");
        console.log(error)
    }
});

bot.onText(/\/addTop100Reports (.+)/, async (msg, match) => {
    try {
        const user = await User.findOne({ where: { username: msg.chat.username } });
        if (user.username == "maximseller" || user.username == "Mr_Li13" || user.username == "Furius16") {
            const resp = match[1];
            console.log(match[1].slice(0, match[1].indexOf(":")), match[1].slice(match[1].indexOf(":") + 1));
            const findUser = await User.findOne({ where: { username: match[1].slice(0, match[1].indexOf(":")) } });
            if (findUser) {
                findUser.subReadyReportsTop100 += Number(match[1].slice(match[1].indexOf(":") + 1));
                await findUser.save();
                await bot.sendMessage(msg.chat.id, `Кол-во отчётов пользователя ${match[1].slice(0, match[1].indexOf(":"))} пополнено на ${Number(match[1].slice(match[1].indexOf(":") + 1))}`)
            } else {
                await bot.sendMessage(msg.chat.id, "Пользователь не найден");
            }
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, "Вы не правильно указали данные");
        console.log(error)
    }
});

bot.onText(/\/addTop100ReportsUnlimited (.+)/, async (msg, match) => {
    try {
        const user = await User.findOne({ where: { username: msg.chat.username } });
        if (user.username == "maximseller" || user.username == "Mr_Li13" || user.username == "Furius16") {
            const resp = match[1];
            console.log(match[1].slice(0, match[1].indexOf(":")), match[1].slice(match[1].indexOf(":") + 1));
            const findUser = await User.findOne({ where: { username: match[1].slice(0, match[1].indexOf(":")) } });
            if (findUser) {
                const date = match[1].slice(match[1].indexOf(":") + 1);
                console.log(`${date.slice(0, 2)}.${date.slice(3, 5)}.${date.slice(6, 10)}`, new Date(date.slice(6, 10), date.slice(3, 5) - 1, date.slice(0, 2)))
                findUser.subReportsIfUnlimited = new Date(date.slice(6, 10), date.slice(3, 5) - 1, date.slice(0, 2));
                findUser.subReportsTop100IfUnlimited = new Date(date.slice(6, 10), date.slice(3, 5) - 1, date.slice(0, 2));
                await findUser.save();
                await bot.sendMessage(msg.chat.id, `Подписка оформлена пользователю ${match[1].slice(0, match[1].indexOf(":"))} до ${date.slice(0, 2)}.${date.slice(3, 5)}.${date.slice(6, 10)}`)
            } else {
                await bot.sendMessage(msg.chat.id, "Пользователь не найден");
            }
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, "Вы не правильно указали данные");
        console.log(error)
    }
});

bot.onText(/\/resetDatabase (.+)/, async (msg, match) => {
    try {
        const user = await User.findOne({ where: { username: msg.chat.username } });
        if (user.username == "maximseller" || user.username == "Mr_Li13" || user.username == "Furius16") {
            const resp = match[1];
            const findUser = await User.findOne({ where: { username: resp } });
            if (findUser) {
                findUser.isOrderReport = false;
                findUser.isOrderBrandReport = false;
                findUser.isOrderKeyWordReport = false;
                await findUser.save();
                await bot.sendMessage(msg.chat.id, "База данных пользователя обновлена")
            } else {
                await bot.sendMessage(msg.chat.id, "Пользователь не найден");
            }
        }
    } catch (error) {
        await bot.sendMessage(msg.chat.id, "Вы не правильно указали данные");
        console.log(error)
    }
});

bot.on("document", async (msg) => {
    await checkCode(msg)
})

bot.on("message", async (msg) => {
    console.log(msg.text)
    if (!msg.text) return;
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
                chat_id: msg.chat.id,
                username: msg.chat.username
            })
        } else if (createdUser.username != msg.chat.username) {
            createdUser.username = msg.chat.username;
            await createdUser.save();
        }
    }
    const user = await User.findOne({ where: { chat_id: msg.chat.id } });
    if (!user) {
        await User.create({
            chat_id: msg.chat.id,
            username: msg.chat.username
        })
    }
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
        if (user.subReportsIfUnlimited && user.subReportsIfUnlimited >= new Date(Date.now()) && user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited >= new Date(Date.now())) {
            resp = await showBalance(`${user.subReportsIfUnlimited.toLocaleString('en-GB', { timeZone: 'Asia/Almaty' })}`, `${user.subReportsTop100IfUnlimited.toLocaleString('en-GB', { timeZone: 'Asia/Almaty' })}`, user)
            await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во отчетов - ${resp.top100Ready}
            `);
        } else if (user.subReportsIfUnlimited && user.subReportsIfUnlimited >= new Date(Date.now()) && user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
            resp = await showBalance(`${user.subReportsIfUnlimited.toLocaleString('en-GB', { timeZone: 'Asia/Almaty' })}`, user.subReadyReportsTop100, user)
            await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во отчетов - ${resp.top100Ready}
            `);
        } else {
            if (user.subReports == 0 && user.subReadyReportsTop100 == 0) {
                resp = await showBalance(user.subReports, user.subReadyReportsTop100, user);
                await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во отчетов - ${resp.top100Ready}
            `,
                    {
                        reply_markup: {
                            inline_keyboard: vars.inlineKeyboardSubscription
                        }
                    });
            } else {
                resp = await showBalance(user.subReports, user.subReadyReportsTop100, user);
                await bot.sendMessage(msg.chat.id, `
Кол-во ссылок - ${resp.linksReports}
Кол-во отчетов - ${resp.top100Ready}
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
    if (user.isOrderBrandReport && !user.isOrderReport && msg.text.indexOf("/") == -1 && msg.text.indexOf("Проверка ссылок") == -1 && msg.text.indexOf("Топ100 по категориям") == -1 && msg.text.indexOf("Топ100 по брендам") == -1 && msg.text.indexOf("Топ100 по ключевым словам") == -1 && msg.text.indexOf("Топ100 по цене") == -1) {
        if (user.subReadyReportsTop100 == 0 && user.subReportsTop100IfUnlimited <= new Date(Date.now())) {
            await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 отчетов по запросу. Оплатите за проверки для работы с ботом.",
                {
                    reply_markup: {
                        inline_keyboard: vars.inlineKeyboardSubscription
                    }
                });
            user.isOrderBrandReport = false;
            user.isOrderKeyWordReport = false;
            user.isOrderReport = false;
            await user.save();
            return;
        }
        await bot.sendMessage(msg.chat.id, `Отчёт по бренду «${msg.text}» формируется, пожалуйста подождите (10-15 минут)`)
        user.isOrderBrandReport = false;
        user.isOrderKeyWordReport = false;
        user.isOrderReport = true;
        await user.save();
        const resp = await parseTop100(`https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3AmanufacturerName%3A${msg.text}`, "brand", msg.text, msg, { rep: "бренду", repReq: msg.text });
        if (resp == -1) {
            await bot.sendMessage(msg.chat.id, "По переданному Вами бренду не найдено ни одного товара")
            user.isOrderBrandReport = false;
            user.isOrderKeyWordReport = false;
            user.isOrderReport = false;
            await user.save();
        } else {
            await filesSender(msg.text, msg.chat.id, vars.folderForBrand);
            user.subReadyReportsTop100 -= 1;
            //user.isOrderReport = true;
            await user.save();
        }
    } else if (user.isOrderBrandReport && !user.isOrderReport && msg.text.indexOf("Проверка ссылок") == -1 && msg.text.indexOf("Топ100 по категориям") == -1 && msg.text.indexOf("Топ100 по брендам") == -1 && msg.text.indexOf("Топ100 по ключевым словам") == -1 && msg.text.indexOf("Топ100 по цене") == -1 && msg.text.indexOf("/") == -1) {
        await bot.sendMessage(msg.chat.id, "Запрошенный ранее отчёт еще не сформирован, пожалуйста подождите")
        return;
    }
    if (user.isOrderKeyWordReport && !user.isOrderReport && msg.text.indexOf("/") == -1 && msg.text.indexOf("Проверка ссылок") == -1 && msg.text.indexOf("Топ100 по категориям") == -1 && msg.text.indexOf("Топ100 по брендам") == -1 && msg.text.indexOf("Топ100 по ключевым словам") == -1 && msg.text.indexOf("Топ100 по цене") == -1) {
        if (user.subReadyReportsTop100 == 0 && (user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited <= new Date(Date.now()))) {
            await bot.sendMessage(msg.chat.id, "У Вас закончились запросы на топ 100 отчетов по запросу. Оплатите за проверки для работы с ботом.",
                {
                    reply_markup: {
                        inline_keyboard: vars.inlineKeyboardSubscription
                    }
                });
            user.isOrderBrandReport = false;
            user.isOrderKeyWordReport = false;
            user.isOrderReport = false;
            await user.save();
            return;
        }
        await bot.sendMessage(msg.chat.id, `Отчёт по ключевому слову «${msg.text}» формируется, пожалуйста подождите (10-15 минут)`)
        user.isOrderBrandReport = false;
        user.isOrderKeyWordReport = false;
        user.isOrderReport = true;
        await user.save();
        const resp = await parseTop100(`https://kaspi.kz/shop/search/?text=${msg.text}`, "word", msg.text, msg, { rep: "ключевому слову", repReq: msg.text });
        if (resp == -1) {
            await bot.sendMessage(msg.chat.id, "По переданному Вами ключевому слову не найдено ни одного товара")
            user.isOrderBrandReport = false;
            user.isOrderKeyWordReport = false;
            user.isOrderReport = false;
            await user.save();
        } else {
            await filesSender(msg.text, msg.chat.id, vars.folderForKeyWord);
            user.subReadyReportsTop100 -= 1;
            await user.save();
        }
    } else if (user.isOrderKeyWordReport && !user.isOrderReport && msg.text.indexOf("Проверка ссылок") == -1 && msg.text.indexOf("Топ100 по категориям") == -1 && msg.text.indexOf("Топ100 по брендам") == -1 && msg.text.indexOf("Топ100 по ключевым словам") == -1 && msg.text.indexOf("Топ100 по цене") == -1 && msg.text.indexOf("/") == -1) {
        await bot.sendMessage(msg.chat.id, "Запрошенный ранее отчёт еще не сформирован, пожалуйста подождите")
        return;
    }
    if (RegExp.test(msg.text)) {
        if (!await checkMember(msg, msg.chat.id)) {
            await bot.sendMessage(msg.chat.id, "Для того чтобы воспользоваться бесплатными ссылками и отчетами, необходимо вступить в группу @top100kaspi");
            return;
        };
        if (msg.text.includes("kaspi.kz/shop/c/")) {
            if (user.isOrderReport) {
                await bot.sendMessage(msg.chat.id, "Запрошенный ранее отчёт еще не сформирован, пожалуйста подождите");
                return;
            }
            if (user.subReadyReportsTop100 != 0 || user.subReportsTop100IfUnlimited && user.subReportsTop100IfUnlimited >= new Date(Date.now())) {
                let response;
                await bot.sendMessage(msg.chat.id, "Отчёт формируется, пожалуйста подождите (10-15 минут)")
                user.isOrderReport = true;
                await user.save();
                if (msg.text.includes("%20")) response = await parseTop100(msg.text, "word", "link", msg, { rep: "категории", repReq: msg.text })
                else response = await parseTop100(msg.text, "category", "link", msg, { rep: "категории", repReq: msg.text });
                if (response == -1) {
                    await bot.sendMessage(msg.chat.id, "По переданной Вами категории не найдено ни одного товара")
                    user.isOrderBrandReport = false;
                    user.isOrderKeyWordReport = false;
                    user.isOrderReport = false;
                    await user.save();
                } else {
                    await filesSender("link", msg.chat.id, vars.folderForCategory);
                    user.subReadyReportsTop100 -= 1;
                    await user.save();
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
                if (data == "Данная ссылка некорректная, пожалуйста скопируйте и вставьте всю ссылку с kaspi.kz") {
                    await bot.sendMessage(msg.chat.id, "Данная ссылка некорректная, пожалуйста скопируйте и вставьте всю ссылку с kaspi.kz");
                    return;
                }
                user.subReports -= 1;
                await user.save();
                await bot.sendMessage(msg.chat.id, `
Top100Kaspi_bot - аналитика продаж на Каспи 

Дата запроса: ${data.date}
••••••••••••••••••••••••••••••••••••••••
🛍 За 14 дней ≈ ${data.sellsFor14Days} продаж(и)
••••••••••••••••••••••••••••••••••••••••
📆 Кол-во продаж в день ≈ ${(data.sellsFor14Days / 14).toFixed(2)} шт.
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
        user.isOrderKeyWordReport = false;
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
        user.isOrderBrandReport = false;
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
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForFuniture
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "home") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForHome
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "clothes") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForClothes
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "jewellery") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForJewellery
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "vehicles") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForVehicles
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "building") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForBuilding
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "health") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForHealth
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "entertainment") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForBooks
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "sport") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForSport
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "shoes") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForShoes
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "children") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForChildren
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "trinkets") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForTrinkets
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "pharmacy") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForPharmacy
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "technique") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForTechnique
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "computers") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForPCs
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "grocery") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForGrocery
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "gadgets") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForGadgets
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "video") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForTV
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "animals") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForAnimals
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "office") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForOffice
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "gifts") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.keyboardForGifts
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        } else if (data == "furnitureAll") { ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/furniture/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureBed") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/bedroom/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureHall") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/living%20room/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureKitchen") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/kitchen/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureChildrenroom") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/children%20room/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureOfice") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/office/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureBath") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/bathroom/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureLobby") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/entrance%20hall/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureFurniture") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fittings%20and%20components%20for%20furniture/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureCupboard") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/storage%20systems%20and%20shelves/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "furnitureSelling") { ///////FURNITURE/////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/trade%20software/all/", "category", data, msg, { rep: "категории", repReq: "Мебель" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeAll") { ///////////////////HOME//////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/home/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeTextilies") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/home%20textiles/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homePlates") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/kitchenware/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeLightning") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/lighting/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeInterier") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/home%20interior/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeHouse") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/household%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeDacha") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/vegetable%20garden%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "homeClever") { ///////////////////HOME//////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/smart%20house/all/", "category", data, msg, { rep: "категории", repReq: "Товары для дома и дачи" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "jewelleryAll") {///////////////////////Jewellary//////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/jewelry%20and%20bijouterie/all/", "category", data, msg, { rep: "категории", repReq: "Украшения" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "jewelleryJewellery") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/jewelry/all/", "category", data, msg, { rep: "категории", repReq: "Украшения" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "jewelleryBijouterie") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/imitation%20jewelry/all/", "category", data, msg, { rep: "категории", repReq: "Украшения" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "jewelleryEquipment") { ///////////////////////Jewellary//////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/jewelry%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Украшения" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehiclesAll") { ///////////////////////VEHICLES//////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/replacement%20parts/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/tires/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20audio/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/protection%20and%20exterior%20tuning/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/rims/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20lighting/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/luggage%20systems/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/automotive%20equipments/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles10") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/oils%20and%20technical%20fluids/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles11") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20chemistry%20and%20car%20care%20products/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles12") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20electronics/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles13") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20batteries/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles14") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/auto%20repair%20tools/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles15") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/motorcycle%20gear/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles16") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/car%20anti-theft%20devices/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles17") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/specialty%20vehicles%20and%20mototechnics/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "vehicles19") { //////////////////////////////////////////////VEHICLES//////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/gbo/all/", "category", data, msg, { rep: "категории", repReq: "Автотовары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "clothesAll") { //////////////////CLOTHES/////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fashion/all/", "category", data, msg, { rep: "категории", repReq: "Одежда" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "clothesWomen") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/women%20fashion/all/", "category", data, msg, { rep: "категории", repReq: "Одежда" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "clothesMen") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/men%20fashion/all/", "category", data, msg, { rep: "категории", repReq: "Одежда" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "clothesGirls") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/girl%20fashion/all/", "category", data, msg, { rep: "категории", repReq: "Одежда" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "clothesBoys") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/boy%20fashion/all/", "category", data, msg, { rep: "категории", repReq: "Одежда" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "clothesBabys") { //////////////////CLOTHES/////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/newborn%20clothing/all/", "category", data, msg, { rep: "категории", repReq: "Одежда" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "buildingAll") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/construction%20and%20repair/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/power%20tools/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/plumbing/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/decoration%20materials/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/electrical%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/building%20materials/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/doors/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/heating%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/construction%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/security%20systems/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building10") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/construction%20protective%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "building11") { /////////////////////BUILDING/////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/gates%20and%20barriers/all/", "category", data, msg, { rep: "категории", repReq: "Строительство, ремонт" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainmentAll") { ////////////////////ENTERTAINMENT////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/leisure/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/books/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hobbies%20and%20crafts/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/party%20games/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/musical%20instruments/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fortune%20telling%20and%20esoteric/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/optical%20instruments/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "entertainment7") {////////////////////ENTERTAINMENT////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/cds%20and%20vinyl/all/", "category", data, msg, { rep: "категории", repReq: "Досуг, книги" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "healthAll") { ////////////////////////HEALTH/////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/beauty%20care/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/nail%20care/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/skin%20care/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hair%20care/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/decorative%20cosmetics/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/body%20care/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/perfumes/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/beauty%20care%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hair%20styling%20and%20care%20tools/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/oral%20care/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health10") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/massagers/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health11") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/tools%20and%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health12") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/skin%20care%20sets/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health13") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/shaving%20and%20hair%20removal/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health14") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/products%20for%20aromatherapy/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health15") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/shaving%20products/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health16") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/products%20for%20tattoos%20and%20permanent%20makeup/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "health17") {/////////////////////HEALTH/////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/beauty%20salon%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Красота и здоровье" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sportAll") {/////////////////////Sport/////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sports%20and%20outdoors/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fishing%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/camping%20and%20hiking/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/cycling/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/winter%20sports/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sports%20nutrition/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sports%20protection/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fitness/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hunting%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sports%20clothing/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport10") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/outdoor/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport11") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/water%20sports/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport12") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/leisure%20sports/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport13") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/exercise%20and%20fitness/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport14") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/boxing%20and%20martial%20arts/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport15") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/climbing%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport16") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/roller%20skating/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport17") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hockey/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport18") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/yoga%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport19") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/rhythmic%20gymnastics%20and%20dance/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport20") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/self-defense%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport21") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/billiard%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport22") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sports%20and%20outdoors/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport23") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/powerlifting/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport24") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/equestrian%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "sport25") {////////////////////////////SPORT//////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/track%20and%20field/all/", "category", data, msg, { rep: "категории", repReq: "Спорт, туризм" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "shoesAll") { /////////////////////Shoes////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/shoes/all/", "category", data, msg, { rep: "категории", repReq: "Обувь" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "shoes1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/women%20shoes/all/", "category", data, msg, { rep: "категории", repReq: "Обувь" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "shoes2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/men%20shoes/all/", "category", data, msg, { rep: "категории", repReq: "Обувь" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "shoes3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/girl%20shoes/all/", "category", data, msg, { rep: "категории", repReq: "Обувь" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "shoes4") { /////////////////////Shoes////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/boy%20shoes/all/", "category", data, msg, { rep: "категории", repReq: "Обувь" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "childrenAll") { //////////////CHILDREN///////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/child%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "children1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/toys/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "children2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/baby%20care/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "children3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/baby%20strolls%20and%20trips/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "children4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/childrens%20transport/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "children5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/playground/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "children6") { //////////////CHILDREN///////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/baby%20feeding/all/", "category", data, msg, { rep: "категории", repReq: "Детские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinketsAll") { //////////////////TRINKETS///////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fashion%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/travel%20gear/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/watches/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hats%20and%20scarves/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/clothing%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fashion%20glasses%20and%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hair%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fashion%20accessory%20sets/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "trinkets9") { //////////////////TRINKETS///////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/wedding%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аксессуары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacyAll") { ///////////////////PHARMACY////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/pharmacy/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/vitamins/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/lenses%20glasses%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/medications%20and%20dietary%20supplements/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/medical%20devices%20and%20consumables/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/medical%20devices%20and%20massagers/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/medical%20devices%20and%20massagers/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/dental%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/enteral%20nutrition/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/laboratory%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy10") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/medical%20furniture/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "pharmacy11") { ///////////////////PHARMACY////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/ophthalmology/all/", "category", data, msg, { rep: "категории", repReq: "Аптека" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "techniqueAll") { //////////////////////TECHNIQUE////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/home%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Бытовая техника" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "technique1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/kitchen%20appliances/all/", "category", data, msg, { rep: "категории", repReq: "Бытовая техника" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "technique2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/big%20home%20appliances/all/", "category", data, msg, { rep: "категории", repReq: "Бытовая техника" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "technique3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/climate%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "Бытовая техника" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "technique4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/small%20home%20appliances/all/", "category", data, msg, { rep: "категории", repReq: "Бытовая техника" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "technique5") { //////////////////////TECHNIQUE////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/vending%20machines/all/", "category", data, msg, { rep: "категории", repReq: "Бытовая техника" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computersAll") { ///////////////////////////COMPUTERS//////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/computers/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/peripherals/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hardware/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/notebooks%20and%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/office%20equipment%20and%20consumables/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/desktop%20computers/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/network%20hardware/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/tablets%20and%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "computers8") { ///////////////////////////COMPUTERS//////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/electronic%20equipment%20for%20trade/all/", "category", data, msg, { rep: "категории", repReq: "Компьютеры" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgetsAll") { /////////////////////////GADGETS/////////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/smartphones%20and%20gadgets/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgets1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/phone%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgets2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/gadgets/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgets3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/smartphones/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgets4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/mobiles/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgets5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/cordless%20telephones/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gadgets6") { /////////////////////////GADGETS/////////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/satellite%20phones%20and%20communicators/all/", "category", data, msg, { rep: "категории", repReq: "Телефоны и гаджеты" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "groceryAll") { //////////////////////////////GROCERY///////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/food/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/alcohol/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/pastry/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/tea%20and%20coffee/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/water%20and%20beverages/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/dairy%20and%20eggs/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/grains%20and%20pasta/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/canned%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/chips%20and%20nuts/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sugar%20salt%20spices/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery10") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/spices%20and%20seasoning/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery11") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/frozen%20foods/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery12") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/sausages%20and%20meat%20delicacies/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery13") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/seafood/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery14") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/meat%20and%20poultry/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery15") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/everything%20for%20baking/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery16") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fruits%20and%20vegetables/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery17") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/bread%20and%20bakery/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery18") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/ready%20meal/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery19") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/freeze%20dried%20food%20on%20a%20camping%20trip/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "grocery20") { ////////////////////////GROCERY//////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/soy%20vegetable%20meat%20sausages%20sausages/all/", "category", data, msg, { rep: "категории", repReq: "Продукты питания" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "videoAll") { ////////////////////////VIDEO/////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/tv_audio/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/audio/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/headphones/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/photo_video/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/entertainment/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/video/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/tvs/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "video7") { ////////////////////////VIDEO/////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/stage%20equipment/all/", "category", data, msg, { rep: "категории", repReq: "ТВ, Аудио, Видео" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animalsAll") { ///////////////////////ANIMALS/////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/pet%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/cat%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/dog%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/pet%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/veterinary%20pharmacy/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/fish%20and%20reptiles%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/hygiene%20and%20care%20for%20animals/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/pet%20grooming/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals8") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/rodents%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals9") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/livestock%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "animals10") { /////////////////////////ANIMALS////////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/bird%20goods/all/", "category", data, msg, { rep: "категории", repReq: "Товары для животных" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "officeAll") { ///////////////////OFFICE///////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/office%20and%20school%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/paper%20products/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/writing%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/office%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/school%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/demonstration%20boards/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/trade%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office7") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/drawing%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "office8") { //////////////////////////////OFFICE////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/post-press%20tools/all/", "category", data, msg, { rep: "категории", repReq: "Канцелярские товары" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "giftsAll") { ///////////////////GIFTS//////////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/gifts%20and%20party%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts1") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/gifts/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts2") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/flowers%20and%20bouquets/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts3") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/new%20year%20decor/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts4") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/holiday%20decorations/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts5") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/gift%20wrapping%20supplies/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts6") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/carnival%20accessories/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "gifts7") { ////////////////////////GIFTS//////////////////////
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/souvenirs/all/", "category", data, msg, { rep: "категории", repReq: "Подарки, товары для праздников" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "upTo10000") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A%D0%B4%D0%BE+10+000+%D1%82", "price", data, msg, { rep: "цене", repReq: "До 10 000 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "from10000to49999") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A10+000+-+49+999+%D1%82", "price", data, msg, { rep: "цене", repReq: "10 000 - 49 999 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "from50000to99999") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A50+000+-+99+999+%D1%82", "price", data, msg, { rep: "цене", repReq: "50 000 - 99 999 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "from100000to149999") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A100+000+-+149+999+%D1%82", "price", data, msg, { rep: "цене", repReq: "100 000 - 149 999 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "from150000to199999") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A150+000+-+199+999+%D1%82", "price", data, msg, { rep: "цене", repReq: "150 000 - 199 999 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "from200000to499999") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A200+000+-+499+999+%D1%82", "price", data, msg, { rep: "цене", repReq: "200 000 - 499 999 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "moreThan500000") {
            if (await categoriesFunc(msg.chat.id, user)) {
                await parseTop100("https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3Aprice%3A%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5+500+000+%D1%82", "price", data, msg, { rep: "цене", repReq: "более 500 000 т" });
                await filesSender(data, msg.chat.id, vars.folderForCategory)
            }
        } else if (data == "demoCategory") {
            await bot.sendDocument(msg.chat.id, "./Reports/top100kaspi_bot-demoCategoryReport_.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "demoBrand") {
            user.isOrderBrandReport = false;
            await user.save();
            await bot.sendDocument(msg.chat.id, "./Reports/top100kaspi_bot-demoBrandReport_.xlsx");
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "demoWord") {
            user.isOrderKeyWordReport = false;
            await user.save();
            await bot.sendDocument(msg.chat.id, "./Reports/top100kaspi_bot-demoWordReport_.xlsx");
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
            await bot.sendMessage(msg.chat.id, "Вышлите пожалуйста квитанцию (обязательно В ФОРМАТЕ PDF) об оплате боту на проверку")
            await bot.answerCallbackQuery({ callback_query_id: callbackQuery.id });
        } else if (data == "comeback") {
            await bot.editMessageReplyMarkup({
                inline_keyboard: vars.inlineKeyboard
            }, {
                chat_id: msg.chat.id,
                message_id: msg.message_id
            });
        }
    } catch (error) {
        console.log(error)
        user.isOrderReport = false;
        await user.save();
        await bot.sendMessage(msg.chat.id, "Произошла ошибка (отчет может быть еще не готов)")
    }
});

(async function () {
    if (!await checkDemoFiles()) {
        await parseTop100("https://kaspi.kz/shop/c/smartphones%20and%20gadgets/all/", "category", "demoCategory", undefined, { rep: "категории", repReq: "Телефоны и гаджеты" });

        await parseTop100(`https://kaspi.kz/shop/c/categories/?q=%3Acategory%3ACategories%3AmanufacturerName%3AApple`, "brand", "demoBrand", undefined, { rep: "бренду", repReq: "Apple" });

        await parseTop100(`https://kaspi.kz/shop/search/?text=смартфон`, "word", "demoWord", undefined, { rep: "ключевому слову", repReq: "смартфон" });
    }
}())