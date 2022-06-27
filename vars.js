const greatingText = `
Хотите расширить ассортимент и найти новые товары для продажи?
Проанализируйте общую динамику продаж товаров в Каспи магазине.
С помощью бота вы сможете узнать примерное количество продаж и выручку товара за последние 14 дней.
Чтобы попробовать просто пришлите нам ссылку на товар:
Например:
https://kaspi.kz/shop/p/chainik-elenberg-zy-304-serebristyi-101378045/?c=750000000`
const brandText = `
С помощью бота вы сможете получить отчёт из Топ100 товаров по кол-ву продаж и выручке за последние 14 дней по нужному бренду.

Просто пришлите нам точное название бренда, время формирования отчёта 10-15 минут
`
const keyWordText = `
С помощью бота вы сможете получить отчёт из Топ100 товаров по кол-ву продаж и выручке за последние 14 дней по нужному ключевому слову.

Просто пришлите нам ключевое слово или словосочетание, время обработки 10-15 минут
`
const categoryText = `
Если вы не нашли нужную категорию, вышлите нам ссылку на неё:
Например: https://kaspi.kz/shop/c/tvs/
`
const contactAdmin = "Контакты админа: @maximseller"
const buySubscription = `
Купить подписку:

 • 5 проверок - 990 тг
 • 10 проверок - 1490 тг
 • Безлимит на проверки (1 месяц) - 4990 тг
 • 1шт Топ100 отчетов -  2990 тг (любой отчет из Топ100)
 • 5шт Топ100 отчетов - 9990 тг (любой отчет из Топ100)
 • 10шт Топ100 отчетов - 14990 тг (любой отчет из Топ100)
 • Безлимит на отчёты и проверки (1 месяц - 49990 тг (Любые отчёты и проверки)
`
const inlineKeyboard = [
    [
        {
            text: "Мебель",
            callback_data : "furniture"
        },
        {
            text: 'Товары для дома и дачи',
            callback_data : "home"
        }
    ],
    [
        {
            text: 'Одежда',
            callback_data : "clothes"
        },
        {
            text: "Украшения",
            callback_data : "jewellery"
        }
    ],
    [
        {
            text: "Автотовары",
            callback_data : "vehicles"
        },
        {
            text: "Строительство, ремонт",
            callback_data : "building"
        }
    ],
    [
        {
            text: "Красота и здоровье",
            callback_data : "health"
        },
        {
            text: "Досуг, книги",
            callback_data : "entertainment"
        }
    ],
    [
        {
            text: "Спорт, туризм",
            callback_data : "sport"
        },
        {
            text: "Обувь",
            callback_data : "shoes"
        }
    ],
    [
        {
            text: "Детские товары",
            callback_data : "children"
        },
        {
            text: "Аксессуары",
            callback_data : "trinkets"
        }
    ],
    [
        {
            text: "Аптека",
            callback_data : "pharmacy"
        },
        {
            text: "Бытовая техника",
            callback_data : "technique"
        }
    ],
    [
        {
            text: "Компьютеры",
            callback_data : "computers"
        },
        {
            text: "Продукты питания",
            callback_data : "grocery"
        }
    ],
    [
        {
            text: "Телефоны и гаджеты",
            callback_data : "gadgets"
        },
        {
            text: "ТВ, Аудио, Видео",
            callback_data : "video"
        }
    ],
    [
        {
            text: "Товары для животных",
            callback_data : "animals"
        },
        {
            text: "Канцелярские товары",
            callback_data : "office"
        }
    ],
    [
        {
            text: "Подарки, товары для праздников",
            callback_data : "gifts"
        }
    ],
    [
        {
            text: 'Пробный отчет по категории "Телефоны и гаджеты"',
            callback_data : "demoCategory"
        }
    ]
]

const inlineKeyboardPrice = [
    [
        {
            text: "До 10 000 т",
            callback_data : "upTo10000"
        },
        {
            text: '10 000 - 49 999 т',
            callback_data : "from10000to49999"
        }
    ],
    [
        {
            text: '50 000 - 99 999 т',
            callback_data : "from50000to99999"
        },
        {
            text: "100 000 - 149 999 т",
            callback_data : "from100000to149999"
        }
    ],
    [
        {
            text: "150 000 - 199 999 т",
            callback_data : "from150000to199999"
        },
        {
            text: "200 000 - 499 999 т",
            callback_data : "from200000to499999"
        }
    ],
    [
        {
            text: "более 500 000 т",
            callback_data : "moreThan500000"
        }
    ]
]

const inlineKeyboardQuestions = [
    [
        {
            text: "Насколько точную информацию предоставляет бот?",
            callback_data : "quest1"
        }
    ],
    [
        {
            text: 'Как мне удостовериться что вы не мошенники?',
            callback_data : "quest2"
        }
    ],
    [
        {
            text: 'Можно ли протестировать сервис бесплатно?',
            callback_data : "quest3"
        }
    ],
    [
        {
            text: "Я хочу получить данные по продажам определенного продавца, возможно ли это?",
            callback_data : "quest4"
        }
    ],
    [
        {
            text: "Будут ли использоваться личные данные моего Каспи кабинета при работе с ботом?",
            callback_data : "quest5"
        }
    ],
    [
        {
            text: "Я оплатил за услугу, но доступ не получил, что мне делать?",
            callback_data : "quest6"
        }
    ]
]

const inlineKeyboardSubscription = [
    [
        {
            text: "5 проверок - 990 тг",
            callback_data : "check5",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=990"
        }
    ],
    [
        {
            text: '10 проверок - 1490тг',
            callback_data : "check10",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=1490"
        }
    ],
    [
        {
            text: 'Безлимит на месяц (проверки) - 4990тг',
            callback_data : "checkUnlimited",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=4990"
        }
    ],
    [
        {
            text: "1 отчёт (любой отчёт) - 2990тг",
            callback_data : "top100buy1",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=2990"
        }
    ],
    [
        {
            text: "5 отчётов (любой отчёт) - 9990тг",
            callback_data : "top100buy5",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=9990"
        }
    ],
    [
        {
            text: "10 отчётов (любой отчёт) - 14990тг",
            callback_data : "top100buy5",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=14990"
        }
    ],
    [
        {
            text: "Безлимит на отчёты и проверки - 49990тг",
            callback_data : "allUnlimited",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=49990"
        }
    ],
    [
        {
            text: "Проверить оплату",
            callback_data : "chechPay"
        }
    ]
]

const answerQuest1 = `
"Насколько точную информацию предоставляет бот?

Бот предоставляет информацию с точностью выше 90% по количеству продаж и выручке, по количеству отзывов и рейтингу товаров точность 100%.`
const answerQuest2 = `
Как мне удостовериться что вы не мошенники?

У нас есть чат для поддержки продавцов на Каспи, среди них есть пользователи, которые регулярно используют бота для анализа товаров на площадке, а также есть администратор, который поможет по всем вопросам, которые у вас возникнут при работе с ботом.`
const answerQuest3 = `
Можно ли протестировать сервис бесплатно?

Да конечно, для новых пользователей предусмотрено 5 бесплатных проверок любых товаров на Каспи.`
const answerQuest4 = `
Я хочу получить данные по продажам определенного продавца, возможно ли это?

Данный бот таких услуг не предоставляет, так как он анализирует общие данные, не требующие доступа к персональным аккаунтам продавцов на Каспи.`
const answerQuest5 = `
Будут ли использоваться личные данные моего Каспи кабинета при работе с ботом?

Нет, никаких персональных данных top100kaspi_bot не использует. Для предоставления доступа у вас попросят предоставить логин/пароль от личного кабинета на Каспи.`
const answerQuest6 = `
Я оплатил за услугу, но доступ не получил, что мне делать?

Вам необходимо связаться с нашим администратором, для этого воспользуйтесь командой /contactadmin`
const folderForCategory = "1UgITnbUaJRRzNWqdpswIdUu-Dqq0l_6D";
const folderForBrand = "1rQELVg-GzZ25Qzau1xKME3XI-7XUhsSC";
const folderForKeyWord = "1g6EipdsNmOu4KqE4bQhbhdpuxcfT4aIu";

module.exports = {
    greatingText : greatingText,
    inlineKeyboard : inlineKeyboard,
    inlineKeyboardPrice : inlineKeyboardPrice,
    inlineKeyboardQuestions : inlineKeyboardQuestions,
    brandText : brandText,
    categoryText : categoryText,
    keyWordText : keyWordText,
    contactAdmin : contactAdmin,
    answerQuest1 : answerQuest1,
    answerQuest2 : answerQuest2,
    answerQuest3 : answerQuest3,
    answerQuest4 : answerQuest4,
    answerQuest5 : answerQuest5,
    answerQuest6 : answerQuest6,
    buySubscription : buySubscription,
    inlineKeyboardSubscription : inlineKeyboardSubscription,
    folderForBrand : folderForBrand,
    folderForCategory : folderForCategory,
    folderForKeyWord : folderForKeyWord
};