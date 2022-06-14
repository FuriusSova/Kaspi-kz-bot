const greatingText = "Хотите расширить ассортимент и найти новые товары для продажи? Проанализируйте общую динамику продаж товаров в Каспи магазине. С помощью бота вы сможете узнать примерное количество продаж и выручку товара за последние 14 дней. Чтобы попробовать просто пришлите нам ссылку на товар: Например: https://kaspi.kz/shop/p/chainik-elenberg-zy-304-serebristyi-101378045/?c=750000000";
const brandText = `Хотите расширить ассортимент и найти новые товары для продажи?
Проанализируйте общую динамику продаж товаров в Каспи магазине.
С помощью бота вы сможете узнать примерное количество продаж и выручку товара за
последние 14 дней по нужному бренду.
Чтобы попробовать просто пришлите нам точное название бренда (как указано на Каспи), время
обработки 5-10 минут`
const keyWordText = `Хотите расширить ассортимент и найти новые товары для продажи?
Проанализируйте общую динамику продаж товаров в Каспи магазине.
С помощью бота вы сможете узнать примерное количество продаж и выручку товара за
последние 14 дней по нужному ключевому слову.
Чтобы попробовать просто пришлите нам любое слово или словосочетание, время обработки 5-10
минут`
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

module.exports = {
    greatingText : greatingText,
    inlineKeyboard : inlineKeyboard,
    inlineKeyboardPrice : inlineKeyboardPrice,
    brandText : brandText,
    keyWordText : keyWordText
};