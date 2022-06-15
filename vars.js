const greatingText = `
Хотите расширить ассортимент и найти новые товары для продажи?
Проанализируйте общую динамику продаж товаров в Каспи магазине.
С помощью бота вы сможете узнать примерное количество продаж и выручку товара за последние 14 дней.
Чтобы попробовать просто пришлите нам ссылку на товар:
Например:
https://kaspi.kz/shop/p/chainik-elenberg-zy-304-serebristyi-101378045/?c=750000000`
const brandText = `Хотите расширить ассортимент и найти новые товары для продажи?
Проанализируйте общую динамику продаж товаров в Каспи магазине.
С помощью бота вы сможете узнать примерное количество продаж и выручку товара за последние 14 дней по нужному бренду.
Чтобы попробовать просто пришлите нам точное название бренда (как указано на Каспи), время обработки 5-10 минут`
const keyWordText = `Хотите расширить ассортимент и найти новые товары для продажи?
Проанализируйте общую динамику продаж товаров в Каспи магазине.
С помощью бота вы сможете узнать примерное количество продаж и выручку товара за последние 14 дней по нужному ключевому слову.
Чтобы попробовать просто пришлите нам любое слово или словосочетание, время обработки 5-10 минут`
const contactAdmin = "Контакты админа: @Mr_Li13"
const inlineKeyboard = [
    [
        {
            text: "Топ 100 по мебели",
            callback_data : "furniture"
        },
        {
            text: 'Топ 100 “Товары для дома и дачи”',
            callback_data : "home"
        }
    ],
    [
        {
            text: 'Топ 100 “Одежда”',
            callback_data : "clothes"
        },
        {
            text: "Топ 100 Украшения",
            callback_data : "jewellery"
        }
    ],
    [
        {
            text: "Топ 100 Автотовары",
            callback_data : "vehicles"
        },
        {
            text: "Топ 100 Строительство, ремонт",
            callback_data : "building"
        }
    ],
    [
        {
            text: "Топ 100 Красота и здоровье",
            callback_data : "health"
        },
        {
            text: "Топ 100 Досуг, книги",
            callback_data : "entertainment"
        }
    ],
    [
        {
            text: "Топ 100 Спорт, туризм",
            callback_data : "sport"
        },
        {
            text: "Топ 100 Обувь",
            callback_data : "shoes"
        }
    ],
    [
        {
            text: "Топ 100 Детские товары",
            callback_data : "children"
        },
        {
            text: "Топ 100 Аксессуары",
            callback_data : "trinkets"
        }
    ],
    [
        {
            text: "Топ 100 Аптека",
            callback_data : "pharmacy"
        },
        {
            text: "Топ 100 Бытовая техника",
            callback_data : "technique"
        }
    ],
    [
        {
            text: "Топ 100 Компьютеры",
            callback_data : "computers"
        },
        {
            text: "Топ 100 Продукты питания",
            callback_data : "grocery"
        }
    ],
    [
        {
            text: "Топ 100 Телефоны и гаджеты",
            callback_data : "gadgets"
        },
        {
            text: "Топ 100 ТВ, Аудио, Видео",
            callback_data : "video"
        }
    ],
    [
        {
            text: "Топ 100 Товары для животных",
            callback_data : "animals"
        },
        {
            text: "Топ 100 Канцелярские товары",
            callback_data : "office"
        }
    ],
    [
        {
            text: "Топ 100 Подарки, товары для праздников",
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

Вам необходимо связаться с нашим администратором, для этого воспользуйтесь командой /contactAdmin`

module.exports = {
    greatingText : greatingText,
    inlineKeyboard : inlineKeyboard,
    inlineKeyboardPrice : inlineKeyboardPrice,
    inlineKeyboardQuestions : inlineKeyboardQuestions,
    brandText : brandText,
    keyWordText : keyWordText,
    contactAdmin : contactAdmin,
    answerQuest1 : answerQuest1,
    answerQuest2 : answerQuest2,
    answerQuest3 : answerQuest3,
    answerQuest4 : answerQuest4,
    answerQuest5 : answerQuest5,
    answerQuest6 : answerQuest6
};