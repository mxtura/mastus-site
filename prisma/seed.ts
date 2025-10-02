/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, ContactSubject, MessageStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
// Разрешаем временно использовать any, чтобы сид работал даже при неактуальном клиенте Prisma
const prismaAny: any = prisma as any;

async function seedAdmin() {
    console.log("Создаем администратора...");
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const admin = await prismaAny.user.upsert({
        where: { login: "admin" },
        update: {
            email: "admin@mastus.ru"
        },
        create: {
            login: "admin",
            email: "admin@mastus.ru",
            password: hashedPassword,
            name: "Администратор МАСТУС",
            role: "ADMIN",
        },
    });
    console.log("Создан администратор (логин):", admin.login);
}

async function seedProducts() {
    console.log("Очищаем существующие продукты...");
    await prisma.product.deleteMany({});

    console.log("Создаем/обновляем категории...");
    type CategorySeed = { code: string; nameRu: string }
    const categories: CategorySeed[] = [
        { code: "MANHOLES", nameRu: "Люки" },
        { code: "SUPPORT_RINGS", nameRu: "Опорные кольца" },
        { code: "LADDERS", nameRu: "Лестницы" },
    ];
    for (const c of categories) {
        await prismaAny.category.upsert({
            where: { code: c.code },
            update: { nameRu: c.nameRu },
            create: { code: c.code, nameRu: c.nameRu },
        });
    }

    console.log("Создаем справочник параметров...");
    const params = [
        { code: 'SIZE', nameRu: 'Размер' },
        { code: 'THICKNESS', nameRu: 'Толщина' },
        { code: 'WEIGHT', nameRu: 'Вес' },
        { code: 'LOAD', nameRu: 'Нагрузка' },
        { code: 'MATERIAL', nameRu: 'Материал' },
        { code: 'COLOR', nameRu: 'Цвет' },
    ];
    for (const p of params) {
        await prismaAny.parameter.upsert({ where: { code: p.code }, update: { nameRu: p.nameRu }, create: p });
    }

    console.log("Назначаем параметры категориям...");
    const catByCode = Object.fromEntries((await prismaAny.category.findMany()).map((c: any) => [c.code, c]));
    const parByCode = Object.fromEntries((await prismaAny.parameter.findMany()).map((p: any) => [p.code, p]));
    const assign = async (catCode: string, parCode: string, visible = true, required = false) => {
        await prismaAny.categoryParam.upsert({
            where: { categoryId_parameterId: { categoryId: catByCode[catCode].id, parameterId: parByCode[parCode].id } },
            update: { visible, required },
            create: { categoryId: catByCode[catCode].id, parameterId: parByCode[parCode].id, visible, required },
        })
    }
    await assign('MANHOLES', 'LOAD', true, true)
    await assign('MANHOLES', 'WEIGHT')
    await assign('MANHOLES', 'SIZE')
    await assign('MANHOLES', 'MATERIAL')
    await assign('SUPPORT_RINGS', 'THICKNESS')
    await assign('SUPPORT_RINGS', 'SIZE')
    await assign('SUPPORT_RINGS', 'MATERIAL')
    await assign('LADDERS', 'WEIGHT')
    await assign('LADDERS', 'SIZE')
    await assign('LADDERS', 'MATERIAL')
    await assign('LADDERS', 'COLOR')

    const products: unknown[] = [
            {
                name: "Люки дачные",
                sku: "MAN-DA-001",
                description:
                    "Дачные люки: легкие, устойчивые к коррозии, подходят для частных участков и садовых зон.",
                category: { connect: { code: "MANHOLES" } },
                images: ["/images/1000018986.png"],
                advantages: [
                    "Легкий монтаж",
                    "Долговечный материал",
                    "Не подвержен коррозии",
                ],
                applications: ["Частные участки", "Садово-огородные зоны"],
                isActive: true,
            },
            {
                name: "Люки ГТС",
                sku: "MAN-GTS-002",
                description:
                    "Люки для городских телекоммуникационных сетей и инженерной инфраструктуры.",
                category: { connect: { code: "MANHOLES" } },
                images: ["/images/1000018987.png"],
                advantages: [
                    "Прочность под городские нагрузки",
                    "Антивандальное исполнение",
                    "Устойчивость к химическому воздействию",
                ],
                applications: [
                    "Городские кабельные колодцы",
                    "Инженерные сети",
                ],
                isActive: true,
            },
            {
                name: "Люк лёгкий 30кН",
                sku: "MAN-L30-003",
                description:
                    "Легкий люк для зон с минимальными нагрузками: газоны, пешеходные участки.",
                category: { connect: { code: "MANHOLES" } },
                images: ["/images/1000018988.png"],
                attributes: { LOAD: "30 кН" },
                advantages: ["Низкий вес", "Экономичность", "Простой монтаж"],
                applications: ["Газоны", "Пешеходные зоны"],
                isActive: true,
            },
            {
                name: "Люк тяжёлый 150-250кН",
                sku: "MAN-H250-004",
                description:
                    "Тяжёлый люк для автомобильных дорог и промышленных площадок с повышенными нагрузками.",
                category: { connect: { code: "MANHOLES" } },
                images: ["/images/1000018990.png"],
                attributes: { LOAD: "150-250 кН" },
                advantages: [
                    "Высокая несущая способность",
                    "Ударопрочность",
                    "Долгий срок службы",
                ],
                applications: [
                    "Автомобильные дороги",
                    "Промышленные территории",
                ],
                isActive: true,
            },
            {
                name: "Люк средний 70кН",
                sku: "MAN-M70-005",
                description:
                    "Средний люк для зон со смешанной нагрузкой: парковки, дворовые территории.",
                category: { connect: { code: "MANHOLES" } },
                images: ["/images/1000018993.png"],
                attributes: { LOAD: "70 кН" },
                advantages: [
                    "Баланс цена/прочность",
                    "Надежная конструкция",
                    "Износостойкость",
                ],
                applications: ["Парковки", "Дворовые территории"],
                isActive: true,
            },
            {
                name: "Аллюминиевая трехсекционная универсальная лестница",
                sku: "LAD-UNI3-006",
                description:
                    "Трехсекционная универсальная алюминиевая лестница для профессионального и бытового применения.",
                category: { connect: { code: "LADDERS" } },
                images: ["/images/IMG_5841.png", "/images/IMG_5844.png"],
                advantages: [
                    "Три режима использования",
                    "Прочный алюминиевый сплав",
                    "Компактное хранение",
                ],
                applications: [
                    "Строительно-монтажные работы",
                    "Склад",
                    "Домашнее использование",
                ],
                isActive: true,
            },
            
    ];

    for (const product of products) {
    await prismaAny.product.create({ data: product });
    console.log(`Создан продукт: ${(product as { name?: string }).name ?? 'без имени'}`);
    }
}

async function seedMessages() {
    console.log("Создаем тестовые сообщения...");
    const messages: Array<
        Parameters<typeof prisma.contactMessage.create>[0]["data"]
    > = [
        {
            name: "Иван Петров",
            email: "ivan.petrov@example.com",
            phone: "+7 (495) 123-45-67",
            company: 'ООО "ТехМаш"',
            subject: ContactSubject.PRICE,
            message:
                "Добрый день! Интересует стоимость и сроки поставки люков полимер-песчаных тип Т. Нужна подробная техническая документация и расчет для 50 штук.",
            status: MessageStatus.NEW,
        },
        {
            name: "Мария Сидорова",
            email: "maria@metalworks.ru",
            phone: "+7 (812) 987-65-43",
            company: "Металлообработка СПб",
            subject: ContactSubject.TECHNICAL,
            message:
                "Нужна техническая консультация по подбору опорных колец для реконструкции канализационной сети. Диаметр колодцев 700-1000 мм.",
            status: MessageStatus.PROCESSING,
        },
        {
            name: "Алексей Козлов",
            email: "a.kozlov@stroy.com",
            phone: "+7 (343) 555-12-34",
            company: "СтройДор",
            subject: ContactSubject.ORDER,
            message:
                "Требуется регулярная поставка люков различных типов для дорожного строительства. Интересуют оптовые цены и условия поставки.",
            status: MessageStatus.COMPLETED,
        },
        {
            name: "Елена Волкова",
            email: "e.volkova@gorod.ru",
            phone: "+7 (495) 777-88-99",
            company: "Управление городского хозяйства",
            subject: ContactSubject.DELIVERY,
            message:
                "Уточните, пожалуйста, возможные сроки доставки в регионы и стоимость транспортировки для крупных партий.",
            status: MessageStatus.NEW,
        },
    ];

    for (const msg of messages) {
        await prisma.contactMessage.create({ data: msg });
        console.log(`Создано сообщение от: ${msg.name}`);
    }
}

async function main() {
    console.log("Начинаем заполнение тестовыми данными...");
    await seedAdmin();
    await seedProducts();
    await seedMessages();
    console.log("Тестовые данные успешно добавлены!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
