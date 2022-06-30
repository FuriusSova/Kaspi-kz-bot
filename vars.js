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
 • Безлимит на отчёты и проверки (1 месяц - 29990 тг (Любые отчёты и проверки)
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

const keyboardForFuniture = [
    [
        {
            text: "Мебель",
            callback_data : "furnitureAll"
        }
    ],
    [
        {
            text: 'Спальня',
            callback_data : "furnitureBed"
        }
    ],
    [
        {
            text: 'Гостиная',
            callback_data : "furnitureHall"
        }
    ],
    [
        {
            text: "Кухня",
            callback_data : "furnitureKitchen"
        }
    ],
    [
        {
            text: "Детская комната",
            callback_data : "furnitureChildrenroom"
        }
    ],
    [
        {
            text: "Офис и кабинет",
            callback_data : "furnitureOfice"
        }
    ],
    [
        {
            text: "Ванная комната",
            callback_data : "furnitureBath"
        }
    ],
    [
        {
            text: "Прихожая",
            callback_data : "furnitureLobby"
        }
    ],
    [
        {
            text: "Фурнитура и комплектующие для мебели",
            callback_data : "furnitureFurniture"
        }
    ],
    [
        {
            text: "Системы хранения, полки, этажерки",
            callback_data : "furnitureCupboard"
        }
    ],
    [
        {
            text: "Торговое оборудование",
            callback_data : "furnitureSelling"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForHome = [
    [
        {
            text: "Товары для дома и дачи",
            callback_data : "homeAll"
        }
    ],
    [
        {
            text: 'Домашний текстиль',
            callback_data : "homeTextilies"
        }
    ],
    [
        {
            text: 'Посуда и принадлежности',
            callback_data : "homePlates"
        }
    ],
    [
        {
            text: "Освещение",
            callback_data : "homeLightning"
        }
    ],
    [
        {
            text: "Интерьер",
            callback_data : "homeInterier"
        }
    ],
    [
        {
            text: "Хозяйственные товары",
            callback_data : "homeHouse"
        }
    ],
    [
        {
            text: "Дача, сад и огород",
            callback_data : "homeDacha"
        }
    ],
    [
        {
            text: "Умный дом",
            callback_data : "homeClever"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForJewellery = [
    [
        {
            text: "Украшения",
            callback_data : "jewelleryAll"
        }
    ],
    [
        {
            text: "Ювелирные украшения",
            callback_data : "jewelleryJewellery"
        }
    ],
    [
        {
            text: 'Бижутерия',
            callback_data : "jewelleryBijouterie"
        }
    ],
    [
        {
            text: 'Ювелирное оборудование, подставки и фурнитура',
            callback_data : "jewelleryEquipment"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForVehicles = [
    [
        {
            text: "Автотовары",
            callback_data : "vehiclesAll"
        }
    ],
    [
        {
            text: "Автозапчасти",
            callback_data : "vehicles1"
        }
    ],
    [
        {
            text: 'Автоаксессуары',
            callback_data : "vehicles2"
        }
    ],
    [
        {
            text: 'Шины',
            callback_data : "vehicles3"
        }
    ],
    [
        {
            text: "Автоакустика",
            callback_data : "vehicles4"
        }
    ],
    [
        {
            text: "Защита и внешний тюнинг",
            callback_data : "vehicles5"
        }
    ],
    [
        {
            text: "Комплекты дисков",
            callback_data : "vehicles6"
        }
    ],
    [
        {
            text: "Автомобильное освещение",
            callback_data : "vehicles7"
        }
    ],
    [
        {
            text: "Багажные системы",
            callback_data : "vehicles8"
        }
    ],
    [
        {
            text: "Автомобильное оборудование",
            callback_data : "vehicles9"
        }
    ],
    [
        {
            text: "Масла и технические жидкости",
            callback_data : "vehicles10"
        }
    ],
    [
        {
            text: "Автохимия и автокосметика",
            callback_data : "vehicles11"
        }
    ],
    [
        {
            text: "Автоэлектроника",
            callback_data : "vehicles12"
        }
    ],
    [
        {
            text: "Аккумуляторы",
            callback_data : "vehicles13"
        }
    ],
    [
        {
            text: "Автоинструменты",
            callback_data : "vehicles14"
        }
    ],
    [
        {
            text: "Мотоэкипировка",
            callback_data : "vehicles15"
        }
    ],
    [
        {
            text: "Автомобильные противоугонные устройства",
            callback_data : "vehicles16"
        }
    ],
    [
        {
            text: "Спецтехника и мототехника",
            callback_data : "vehicles17"
        }
    ],
    [
        {
            text: "Автосервисное оборудование",
            callback_data : "vehicles18"
        }
    ],
    [
        {
            text: "ГБО",
            callback_data : "vehicles19"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForClothes = [
    [
        {
            text: "Одежда",
            callback_data : "clothesAll"
        }
    ],
    [
        {
            text: "Женщинам",
            callback_data : "clothesWomen"
        }
    ],
    [
        {
            text: 'Мужчинам',
            callback_data : "clothesMen"
        }
    ],
    [
        {
            text: 'Девочкам',
            callback_data : "clothesGirls"
        }
    ],
    [
        {
            text: 'Мальчикам',
            callback_data : "clothesBoys"
        }
    ],
    [
        {
            text: 'Одежда для новорожденных',
            callback_data : "clothesBabys"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForBuilding = [
    [
        {
            text: "Строительство, ремонт",
            callback_data : "buildingAll"
        }
    ],
    [
        {
            text: "Инструменты",
            callback_data : "building1"
        }
    ],
    [
        {
            text: "Сантехника",
            callback_data : "building2"
        }
    ],
    [
        {
            text: "Отделочные материалы",
            callback_data : "building3"
        }
    ],
    [
        {
            text: "Электрика",
            callback_data : "building4"
        }
    ],
    [
        {
            text: "Строительные материалы",
            callback_data : "building5"
        }
    ],
    [
        {
            text: "Двери и окна",
            callback_data : "building6"
        }
    ],
    [
        {
            text: "Системы отопления и вентиляции",
            callback_data : "building7"
        }
    ],
    [
        {
            text: "Строительное оборудование",
            callback_data : "building8"
        }
    ],
    [
        {
            text: "Системы безопасности",
            callback_data : "building9"
        }
    ],
    [
        {
            text: "Средства индивидуальной защиты",
            callback_data : "building10"
        }
    ],
    [
        {
            text: "Ворота и ограждения",
            callback_data : "building11"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForBooks = [
    [
        {
            text: "Досуг, книги",
            callback_data : "entertainmentAll"
        }
    ],
    [
        {
            text: "Книги",
            callback_data : "entertainment1"
        }
    ],
    [
        {
            text: 'Хобби и творчество',
            callback_data : "entertainment2"
        }
    ],
    [
        {
            text: "Игры для компаний",
            callback_data : "entertainment3"
        }
    ],
    [
        {
            text: "Музыкальные инструменты",
            callback_data : "entertainment4"
        }
    ],
    [
        {
            text: "Гадания и эзотерика",
            callback_data : "entertainment5"
        }
    ],
    [
        {
            text: "Оптические приборы",
            callback_data : "entertainment6"
        }
    ],
    [
        {
            text: "Музыкальные диски и пластинки",
            callback_data : "entertainment7"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForHealth = [
    [
        {
            text: "Красота и здоровье",
            callback_data : "healthAll"
        }
    ],
    [
        {
            text: "Для маникюра и педикюра",
            callback_data : "health1"
        }
    ],
    [
        {
            text: "Уход за лицом",
            callback_data : "health2"
        }
    ],
    [
        {
            text: "Уход за волосами",
            callback_data : "health3"
        }
    ],
    [
        {
            text: "Декоративная косметика",
            callback_data : "health4"
        }
    ],
    [
        {
            text: "Уход за телом",
            callback_data : "health5"
        }
    ],
    [
        {
            text: "Парфюмерия",
            callback_data : "health6"
        }
    ],
    [
        {
            text: "Техника и оборудование для красоты",
            callback_data : "health7"
        }
    ],
    [
        {
            text: "Инструменты для укладки, ухода и наращивания волос",
            callback_data : "health8"
        }
    ],
    [
        {
            text: "Уход за полостью рта",
            callback_data : "health9"
        }
    ],
    [
        {
            text: "Массажеры, массажные кресла, миостимуляторы",
            callback_data : "health10"
        }
    ],
    [
        {
            text: "Инструменты и аксессуары",
            callback_data : "health11"
        }
    ],
    [
        {
            text: "Декоративные и уходовые наборы косметики",
            callback_data : "health12"
        }
    ],
    [
        {
            text: "Депиляция и эпиляция",
            callback_data : "health13"
        }
    ],
    [
        {
            text: "Товары для ароматерапии",
            callback_data : "health14"
        }
    ],
    [
        {
            text: "Товары для бритья",
            callback_data : "health15"
        }
    ],
    [
        {
            text: "Товары для тату и перманентного макияжа",
            callback_data : "health16"
        }
    ],
    [
        {
            text: "Мебель и оборудование для салонов красоты",
            callback_data : "health17"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForSport = [
    [
        {
            text: "Спорт, туризм",
            callback_data : "sportAll"
        }
    ],
    [
        {
            text: "Товары для рыбалки",
            callback_data : "sport1"
        }
    ],
    [
        {
            text: "Туризм и отдых на природе",
            callback_data : "sport2"
        }
    ],
    [
        {
            text: "Велоспорт",
            callback_data : "sport3"
        }
    ],
    [
        {
            text: "Зимний спорт",
            callback_data : "sport4"
        }
    ],
    [
        {
            text: "Спортивное питание",
            callback_data : "sport5"
        }
    ],
    [
        {
            text: "Спортивная защита и экипировка",
            callback_data : "sport6"
        }
    ],
    [
        {
            text: "Товары для фитнеса",
            callback_data : "sport7"
        }
    ],
    [
        {
            text: "Товары для охоты и стрельбы",
            callback_data : "sport8"
        }
    ],
    [
        {
            text: "Спортивная одежда и обувь",
            callback_data : "sport9"
        }
    ],
    [
        {
            text: "Самокаты, гироскутеры, моноколеса",
            callback_data : "sport10"
        }
    ],
    [
        {
            text: "Водный спорт",
            callback_data : "sport11"
        }
    ],
    [
        {
            text: "Спортивные игры",
            callback_data : "sport12"
        }
    ],
    [
        {
            text: "Тренажеры",
            callback_data : "sport13"
        }
    ],
    [
        {
            text: "Бокс и единоборства",
            callback_data : "sport14"
        }
    ],
    [
        {
            text: "Альпинизм и скалолазание",
            callback_data : "sport15"
        }
    ],
    [
        {
            text: "Роликовые коньки и лыжероллеры",
            callback_data : "sport16"
        }
    ],
    [
        {
            text: "Хоккей",
            callback_data : "sport17"
        }
    ],
    [
        {
            text: "Товары для йоги",
            callback_data : "sport18"
        }
    ],
    [
        {
            text: "Художественная гимнастика и танцы",
            callback_data : "sport19"
        }
    ],
    [
        {
            text: "Товары для самообороны",
            callback_data : "sport20"
        }
    ],
    [
        {
            text: "Бильярд",
            callback_data : "sport21"
        }
    ],
    [
        {
            text: "Пауэрлифтинг",
            callback_data : "sport22"
        }
    ],
    [
        {
            text: "Бейсбольные биты",
            callback_data : "sport23"
        }
    ],
    [
        {
            text: "Конный спорт",
            callback_data : "sport24"
        }
    ],
    [
        {
            text: "Легкая атлетика",
            callback_data : "sport25"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForShoes = [
    [
        {
            text: "Обувь",
            callback_data : "shoesAll"
        }
    ],
    [
        {
            text: "Женская обувь",
            callback_data : "shoes1"
        }
    ],
    [
        {
            text: "Мужская обувь",
            callback_data : "shoes2"
        }
    ],
    [
        {
            text: "Обувь для девочек",
            callback_data : "shoes3"
        }
    ],
    [
        {
            text: "Обувь для мальчиков",
            callback_data : "shoes4"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForChildren = [
    [
        {
            text: "Детские товары",
            callback_data : "childrenAll"
        }
    ],
    [
        {
            text: "Игрушки",
            callback_data : "children1"
        }
    ],
    [
        {
            text: "Для малыша и мамы",
            callback_data : "children2"
        }
    ],
    [
        {
            text: "Прогулки и поездки",
            callback_data : "children3"
        }
    ],
    [
        {
            text: "Детский транспорт",
            callback_data : "children4"
        }
    ],
    [
        {
            text: "Игровая площадка",
            callback_data : "children5"
        }
    ],
    [
        {
            text: "Детское питание",
            callback_data : "children6"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForTrinkets = [
    [
        {
            text: "Аксессуары",
            callback_data : "trinketsAll"
        }
    ],
    [
        {
            text: "Сумки, чемоданы, кошельки",
            callback_data : "trinkets1"
        }
    ],
    [
        {
            text: "Часы",
            callback_data : "trinkets2"
        }
    ],
    [
        {
            text: "Шапки, шарфы, перчатки",
            callback_data : "trinkets3"
        }
    ],
    [
        {
            text: "Аксессуары для одежды",
            callback_data : "trinkets4"
        }
    ],
    [
        {
            text: "Очки и аксессуары",
            callback_data : "trinkets5"
        }
    ],
    [
        {
            text: "Аксессуары для волос",
            callback_data : "trinkets6"
        }
    ],
    [
        {
            text: "Зонты, брелоки и портсигары",
            callback_data : "trinkets7"
        }
    ],
    [
        {
            text: "Комплекты аксессуаров",
            callback_data : "trinkets8"
        }
    ],
    [
        {
            text: "Свадебные аксессуары",
            callback_data : "trinkets9"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForPharmacy = [
    [
        {
            text: "Аптека",
            callback_data : "pharmacyAll"
        }
    ],
    [
        {
            text: "Витамины и БАД",
            callback_data : "pharmacy1"
        }
    ],
    [
        {
            text: "Оптика",
            callback_data : "pharmacy2"
        }
    ],
    [
        {
            text: "Лекарства и травы",
            callback_data : "pharmacy3"
        }
    ],
    [
        {
            text: "Изделия медицинского назначения",
            callback_data : "pharmacy4"
        }
    ],
    [
        {
            text: "Ортопедия",
            callback_data : "pharmacy5"
        }
    ],
    [
        {
            text: "Медтехника",
            callback_data : "pharmacy6"
        }
    ],
    [
        {
            text: "Стоматология",
            callback_data : "pharmacy7"
        }
    ],
    [
        {
            text: "Энтеральное питание",
            callback_data : "pharmacy8"
        }
    ],
    [
        {
            text: "Лабораторное оборудование и материалы",
            callback_data : "pharmacy9"
        }
    ],
    [
        {
            text: "Мебель медицинская",
            callback_data : "pharmacy10"
        }
    ],
    [
        {
            text: "Офтальмология",
            callback_data : "pharmacy11"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForTechnique = [
    [
        {
            text: "Бытовая техника",
            callback_data : "techniqueAll"
        }
    ],
    [
        {
            text: "Мелкая техника для кухни",
            callback_data : "technique1"
        }
    ],
    [
        {
            text: "Крупная техника для дома",
            callback_data : "technique2"
        }
    ],
    [
        {
            text: "Климатическая техника",
            callback_data : "technique3"
        }
    ],
    [
        {
            text: "Малая техника для дома",
            callback_data : "technique4"
        }
    ],
    [
        {
            text: "Торговые автоматы",
            callback_data : "technique5"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForPCs = [
    [
        {
            text: "Компьютеры",
            callback_data : "computersAll"
        }
    ],
    [
        {
            text: "Периферия",
            callback_data : "computers1"
        }
    ],
    [
        {
            text: "Комплектующие",
            callback_data : "computers2"
        }
    ],
    [
        {
            text: "Ноутбуки и аксессуары",
            callback_data : "computers3"
        }
    ],
    [
        {
            text: "Оргтехника и расходные материалы",
            callback_data : "computers4"
        }
    ],
    [
        {
            text: "Настольные компьютеры",
            callback_data : "computers5"
        }
    ],
    [
        {
            text: "Сетевое оборудование",
            callback_data : "computers6"
        }
    ],
    [
        {
            text: "Планшеты и аксессуары",
            callback_data : "computers7"
        }
    ],
    [
        {
            text: "Электронное оборудование для торговли",
            callback_data : "computers8"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForGadgets = [
    [
        {
            text: "Телефоны и гаджеты",
            callback_data : "gadgetsAll"
        }
    ],
    [
        {
            text: "Аксессуары для телефонов",
            callback_data : "gadgets1"
        }
    ],
    [
        {
            text: "Гаджеты",
            callback_data : "gadgets2"
        }
    ],
    [
        {
            text: "Смартфоны",
            callback_data : "gadgets3"
        }
    ],
    [
        {
            text: "Мобильные телефоны",
            callback_data : "gadgets4"
        }
    ],
    [
        {
            text: "Радиотелефоны",
            callback_data : "gadgets5"
        }
    ],
    [
        {
            text: "Спутниковые телефоны и коммуникаторы",
            callback_data : "gadgets6"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForGrocery = [
    [
        {
            text: "Продукты питания",
            callback_data : "groceryAll"
        }
    ],
    [
        {
            text: "Алкоголь",
            callback_data : "grocery1"
        }
    ],
    [
        {
            text: "Сладости и выпечка",
            callback_data : "grocery2"
        }
    ],
    [
        {
            text: "Чай, кофе, какао",
            callback_data : "grocery3"
        }
    ],
    [
        {
            text: "Соки, вода, напитки",
            callback_data : "grocery4"
        }
    ],
    [
        {
            text: "Молочные продукты, яйца",
            callback_data : "grocery5"
        }
    ],
    [
        {
            text: "Крупы, хлопья, макароны",
            callback_data : "grocery6"
        }
    ],
    [
        {
            text: "Консервация",
            callback_data : "grocery7"
        }
    ],
    [
        {
            text: "Чипсы, орехи, снэки",
            callback_data : "grocery8"
        }
    ],
    [
        {
            text: "Сахар и заменители, соль, специи",
            callback_data : "grocery9"
        }
    ],
    [
        {
            text: "Масла, соусы",
            callback_data : "grocery10"
        }
    ],
    [
        {
            text: "Замороженные продукты, мороженое",
            callback_data : "grocery11"
        }
    ],
    [
        {
            text: "Колбасы, сосиски, деликатесы",
            callback_data : "grocery12"
        }
    ],
    [
        {
            text: "Рыба, морепродукты",
            callback_data : "grocery13"
        }
    ],
    [
        {
            text: "Мясо и птица",
            callback_data : "grocery14"
        }
    ],
    [
        {
            text: "Все для выпечки",
            callback_data : "grocery15"
        }
    ],
    [
        {
            text: "Овощи, фрукты, ягоды, грибы",
            callback_data : "grocery16"
        }
    ],
    [
        {
            text: "Хлебные изделия",
            callback_data : "grocery17"
        }
    ],
    [
        {
            text: "Готовая еда",
            callback_data : "grocery18"
        }
    ],
    [
        {
            text: "Сублимированная туристическая еда",
            callback_data : "grocery19"
        }
    ],
    [
        {
            text: "Соевое, растительное мясо, колбасы, сыры",
            callback_data : "grocery20"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForTV = [
    [
        {
            text: "ТВ, Аудио, Видео",
            callback_data : "videoAll"
        }
    ],
    [
        {
            text: "Аудиотехника",
            callback_data : "video1"
        }
    ],
    [
        {
            text: "Наушники и гарнитуры",
            callback_data : "video2"
        }
    ],
    [
        {
            text: "Фото и видеокамеры",
            callback_data : "video3"
        }
    ],
    [
        {
            text: "Развлечения",
            callback_data : "video4"
        }
    ],
    [
        {
            text: "Видеотехника",
            callback_data : "video5"
        }
    ],
    [
        {
            text: "Телевизоры",
            callback_data : "video6"
        }
    ],
    [
        {
            text: "Сценическое оборудование",
            callback_data : "video7"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForAnimals = [
    [
        {
            text: "Товары для животных",
            callback_data : "animalsAll"
        }
    ],
    [
        {
            text: "Для кошек",
            callback_data : "animals1"
        }
    ],
    [
        {
            text: "Для собак",
            callback_data : "animals2"
        }
    ],
    [
        {
            text: "Аксессуары для животных",
            callback_data : "animals3"
        }
    ],
    [
        {
            text: "Ветаптека",
            callback_data : "animals4"
        }
    ],
    [
        {
            text: "Для рыб и рептилий",
            callback_data : "animals5"
        }
    ],
    [
        {
            text: "Гигиена и уход за животными",
            callback_data : "animals6"
        }
    ],
    [
        {
            text: "Груминг",
            callback_data : "animals7"
        }
    ],
    [
        {
            text: "Для грызунов",
            callback_data : "animals8"
        }
    ],
    [
        {
            text: "Для сельскохозяйственных животных",
            callback_data : "animals9"
        }
    ],
    [
        {
            text: "Для птиц",
            callback_data : "animals10"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForOffice = [
    [
        {
            text: "Канцелярские товары",
            callback_data : "officeAll"
        }
    ],
    [
        {
            text: "Бумага и бумажная продукция",
            callback_data : "office1"
        }
    ],
    [
        {
            text: "Письменные принадлежности",
            callback_data : "office2"
        }
    ],
    [
        {
            text: "Офисные принадлежности",
            callback_data : "office3"
        }
    ],
    [
        {
            text: "Школьные принадлежности",
            callback_data : "office4"
        }
    ],
    [
        {
            text: "Демонстрационные доски",
            callback_data : "office5"
        }
    ],
    [
        {
            text: "Торговые и рекламные принадлежности",
            callback_data : "office6"
        }
    ],
    [
        {
            text: "Чертежные принадлежности",
            callback_data : "office7"
        }
    ],
    [
        {
            text: "Постпечатное оборудование",
            callback_data : "office8"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
        }
    ]
]

const keyboardForGifts = [
    [
        {
            text: "Подарки, товары для праздников",
            callback_data : "giftsAll"
        }
    ],
    [
        {
            text: "Подарки",
            callback_data : "gifts1"
        }
    ],
    [
        {
            text: "Цветы и букеты",
            callback_data : "gifts2"
        }
    ],
    [
        {
            text: "Новогодние товары",
            callback_data : "gifts3"
        }
    ],
    [
        {
            text: "Украшения для праздников",
            callback_data : "gifts4"
        }
    ],
    [
        {
            text: "Подарочная упаковка",
            callback_data : "gifts5"
        }
    ],
    [
        {
            text: "Карнавальные костюмы, аксессуары для вечеринок",
            callback_data : "gifts6"
        }
    ],
    [
        {
            text: "Сувенирная продукция",
            callback_data : "gifts7"
        }
    ],
    [
        {
            text: "Вернуться назад",
            callback_data : "comeback"
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
            text: "Безлимит на отчёты и проверки - 29990тг",
            callback_data : "allUnlimited",
            url : "https://www.wooppay.com/simpleInvoice?token=eyJraWQiOiJrZXkxIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ3b29wcGF5LmNvbSIsImF1ZCI6Indvb3BwYXkuY29tIiwiZXhwIjoxOTcxMDIzOTY1LCJqdGkiOiJ1a21PNzBRSXJxcWFQTlBDbFZWMGZBIiwiaWF0IjoxNjU1NDA0NzY1LCJuYmYiOjE2NTU0MDQ3NjUsInN1YiI6InNtYXJ0c2hvcF9Ub3AxMDBLYXNwaV9ib3QiLCJ1c2VySWQiOjM5MzM4NjI3LCJ0b2tlblR5cGUiOiJXRUIiLCJkZXZpY2VJZCI6InNhdHVfc21hcnRzaG9wX1RvcDEwMEthc3BpX2JvdCIsImRlc2NyaXB0aW9uIjoiVG9wMTAwS2FzcGlfYm90In0.9OUk2J61ehpHdvb80g2GAgswdczjyJsT2MgKI_sUHBRgwP6MamuQsWcRz6dxKTnyx-8uLza2njCanXeO8YE78g&amount=29990"
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
    folderForKeyWord : folderForKeyWord,
    keyboardForFuniture : keyboardForFuniture,
    keyboardForHome : keyboardForHome,
    keyboardForJewellery : keyboardForJewellery,
    keyboardForVehicles : keyboardForVehicles,
    keyboardForClothes : keyboardForClothes,
    keyboardForBuilding : keyboardForBuilding,
    keyboardForBooks : keyboardForBooks,
    keyboardForHealth : keyboardForHealth,
    keyboardForSport : keyboardForSport,
    keyboardForShoes : keyboardForShoes,
    keyboardForChildren : keyboardForChildren,
    keyboardForTrinkets : keyboardForTrinkets,
    keyboardForPharmacy : keyboardForPharmacy,
    keyboardForTechnique : keyboardForTechnique,
    keyboardForPCs : keyboardForPCs,
    keyboardForGadgets : keyboardForGadgets,
    keyboardForGrocery : keyboardForGrocery,
    keyboardForTV : keyboardForTV,
    keyboardForAnimals : keyboardForAnimals,
    keyboardForOffice : keyboardForOffice,
    keyboardForGifts : keyboardForGifts
};