# О проекте
Серверное приложение «Sort» – это REST API и WebSocket сервер, предназначенный для управления системой сортировки.
Проект построен на Node.js с использованием Express, Sequelize (ORM) для работы с PostgreSQL, WebSocket для реального времени и Webpack для сборки production-версии.

Основные функции:

REST API endpoints (префикс /api)

WebSocket сервер (для взаимодействия со сканерами и камерами)

Загрузка файлов (express‑fileupload)

Работа с базой данных через Sequelize (автоматическая синхронизация моделей)

Гибкая настройка через переменные окружения (.env)

# Требования
Node.js (версия 18+)

npm или yarn (рекомендуется yarn, но можно использовать npm)

PostgreSQL (можно запустить через Docker, см. ниже)

Docker (опционально, для базы данных)

# Установка

Клонируйте репозиторий:

bash
```
git clone <repository-url>

cd sort
```
Установите зависимости:

bash

```npm install```

# или
```yarn install```

# Порт сервера
```
PORT=5000
```
# Настройки базы данных PostgreSQL
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sorting_db
```

Запуск базы данных (PostgreSQL)
Проект включает docker-compose.yml для быстрого поднятия PostgreSQL:

bash
````
docker-compose up -d
````
Это создаст контейнер sorting-system-db с образом postgres:18.3-alpine3.23 и смонтирует локальную папку ./data для хранения данных.

Убедитесь, что переменные окружения в .env соответствуют настройкам контейнера (по умолчанию: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=postgres – но вы можете переопределить их в Docker Compose или в .env).

Запуск в режиме разработки
Для разработки используется nodemon для автоматического перезапуска сервера при изменениях:

bash
```
npm run dev
```
# или
```
yarn dev
```
Сервер запустится на порту, указанном в .env (по умолчанию 5000).
При старте выполняется подключение к БД и синхронизация моделей (создание таблиц, если их нет).

Сборка и запуск в production
Сборка с Webpack
Webpack собирает приложение в один бандл для production:

bash
```
npm run build
```
# или
yarn build
Результат сборки сохраняется в dist/build.js (согласно webpack.config.js).
В процессе сборки используется dotenv-webpack для внедрения переменных окружения в бандл.

Запуск собранного приложения
По умолчанию в package.json скрипт start указан как node dist/bundle.js, однако Webpack генерирует build.js.
Чтобы запустить production‑версию, выполните:

bash
```
node dist/build.js
```
Либо измените скрипт start в package.json на:

json
```
"start": "node dist/build.js"
```
Запуск с помощью bat‑файлов (Windows)
В корне проекта есть два вспомогательных скрипта для Windows:

run-windows.bat – устанавливает зависимости и запускает сервер в режиме разработки (node index.js).

build-windows.bat – устанавливает dev‑зависимости, выполняет сборку Webpack и открывает папку dist в проводнике.

Используйте их, если работаете в среде Windows и предпочитаете bat‑файлы.

#Структура проекта (основные папки)
```
sort/
├── controllers/# Контроллеры (логика обработки запросов)
├── database/# Подключение к БД и модели Sequelize
├── middleware/ # Промежуточные обработчики (например, error‑handler)
├── modules/ # Вспомогательные модули (logger, config и т.д.)
├── routes/# Определение маршрутов REST API
├── services/ # Сервисы (сканер, камера, WebSocket клиенты)
├── .env# Переменные окружения (не в репозитории)
├── docker-compose.yml# Конфигурация Docker для PostgreSQL
├── index.js# Главный входной файл
├── package.json# Зависимости и скрипты
├── webpack.config.js# Конфигурация Webpack
├── run-windows.bat# Запуск в Windows
├── build-windows.bat# Сборка в Windows
└── README.md# Этот файл
```

Ниже представлено описание всех таблиц базы данных проекта «Sort».

---

## Общие соглашения

- **Первичные ключи** – поля с суффиксом `_id`, автоинкрементные (`INTEGER`).
- **Временные метки** – если включены `timestamps: true`, то добавляются поля `created_at` (всегда) и `updated_at` (только если не отключено). В большинстве моделей `updatedAt: false`, поэтому `updated_at` отсутствует.
- **ENUM** – строковые перечисления с допустимыми значениями.
- **Связи** – внешние ключи (references) указаны в моделях, описаны в конце файла. В описании таблиц приведены связи с другими таблицами.

---

## Таблица `Address`  
Хранит почтовые адреса.

| Поле          | Тип             | Ограничения         | Описание                         |
|---------------|-----------------|---------------------|----------------------------------|
| address_id    | INTEGER         | PRIMARY KEY, AUTO_INCREMENT | Уникальный идентификатор адреса |
| country       | STRING(100)     | NOT NULL            | Страна                           |
| region        | STRING(100)     |                     | Регион/область                   |
| city          | STRING(100)     | NOT NULL            | Город                            |
| street        | STRING(100)     | NOT NULL            | Улица                            |
| building      | STRING(100)     | NOT NULL            | Номер дома/строения              |
| postal_code   | STRING(20)      | NOT NULL            | Почтовый индекс                  |

**Индексы:** отсутствуют.  
**Связи:**  
- `Address` → `Warehouse` (один ко многим, foreign key `address_id`)  
- `Address` → `Customer` (один ко многим, foreign key `address_id`)

---

## Таблица `Warehouse`  
Склады.

| Поле          | Тип             | Ограничения         | Описание                         |
|---------------|-----------------|---------------------|----------------------------------|
| warehouse_id  | INTEGER         | PRIMARY KEY, AUTO_INCREMENT | Идентификатор склада            |
| name          | STRING(150)     | NOT NULL            | Название склада                  |
| address_id    | INTEGER         | NOT NULL            | Внешний ключ к `Address`        |
| created_at    | DATE            | Автоматически       | Дата создания (timestamps)      |

**Индексы:** нет.  
**Связи:**  
- `Warehouse.belongsTo(Address)`  
- `Warehouse.hasMany(Part)`

---

## Таблица `Employee`  
Сотрудники.

| Поле          | Тип             | Ограничения         | Описание                         |
|---------------|-----------------|---------------------|----------------------------------|
| employee_id   | INTEGER         | PRIMARY KEY, AUTO_INCREMENT | Идентификатор сотрудника       |
| first_name    | STRING(50)      | NOT NULL            | Имя                              |
| last_name     | STRING(50)      | NOT NULL            | Фамилия                          |
| middle_name   | STRING(50)      |                     | Отчество                         |
| role          | ENUM('qc','manager') | DEFAULT 'qc'    | Роль: контролёр качества или менеджер |
| is_active     | BOOLEAN         | DEFAULT true       | Активен ли сотрудник             |
| created_at    | DATE            | Автоматически       | Дата создания                    |

**Индексы:** нет.  
**Связи:**  
- `Employee.hasMany(Shift)`  
- `Employee.hasMany(LoggingScans)` (как `user_id`)  
- `Employee.hasMany(Part)` (как `qc_inspector_id`)

---

## Таблица `Shift`  
Рабочие смены сотрудников.

| Поле            | Тип      | Ограничения                      | Описание                         |
|-----------------|----------|----------------------------------|----------------------------------|
| shift_id        | INTEGER  | PRIMARY KEY, AUTO_INCREMENT     | Идентификатор смены              |
| employee_id     | INTEGER  | NOT NULL, FOREIGN KEY → Employee| Сотрудник                        |
| start_datetime  | DATE     | NOT NULL                         | Начало смены                     |
| end_datetime    | DATE     | NOT NULL                         | Конец смены                      |
| created_at      | DATE     | Автоматически                    | Дата создания                    |

**Индексы:**  
- `idx_shift_employee` на `employee_id`  
- `idx_shift_datetime` на `(start_datetime, end_datetime)`  

**Связи:**  
- `Shift.belongsTo(Employee)`

---

## Таблица `Customer`  
Заказчики.

| Поле          | Тип             | Ограничения         | Описание                         |
|---------------|-----------------|---------------------|----------------------------------|
| customer_id   | INTEGER         | PRIMARY KEY, AUTO_INCREMENT | Идентификатор заказчика        |
| company_name  | STRING(200)     | NOT NULL            | Название компании                |
| inn           | STRING(12)      | NOT NULL, UNIQUE    | ИНН                              |
| ogrn          | STRING(15)      | NOT NULL, UNIQUE    | ОГРН                             |
| address_id    | INTEGER         | NOT NULL, FOREIGN KEY → Address | Юридический адрес              |
| created_at    | DATE            | Автоматически       | Дата создания                    |

**Индексы:**  
- `idx_customer` на `(company_name, inn, ogrn)`  

**Связи:**  
- `Customer.belongsTo(Address)`  
- `Customer.hasMany(Order)`

---

## Таблица `Orders` (модель `Order`)  
Заказы на производство/сортировку.

| Поле          | Тип                          | Ограничения         | Описание                         |
|---------------|------------------------------|---------------------|----------------------------------|
| order_id      | INTEGER                      | PRIMARY KEY, AUTO_INCREMENT | Идентификатор заказа           |
| order_number  | STRING(50)                   | NOT NULL, UNIQUE    | Номер заказа (внешний)          |
| customer_id   | INTEGER                      | NOT NULL, FOREIGN KEY → Customer | Заказчик                  |
| priority      | INTEGER                      | NOT NULL, DEFAULT 1 | Приоритет (число)               |
| status        | ENUM('pending','in_production','sorting','completed','canceled') | DEFAULT 'pending' | Статус заказа |
| notes         | TEXT                         |                     | Примечания                       |
| created_at    | DATE                         | Автоматически       | Дата создания                    |

**Индексы:**  
- `idx_orders` на `(order_number, created_at, status)`  

**Связи:**  
- `Order.belongsTo(Customer)`  
- `Order.hasMany(OrderItem)`

---

## Таблица `Part_Types` (модель `PartType`)  
Типы деталей.

| Поле          | Тип             | Ограничения         | Описание                         |
|---------------|-----------------|---------------------|----------------------------------|
| part_type_id  | INTEGER         | PRIMARY KEY, AUTO_INCREMENT | Идентификатор типа детали     |
| name          | STRING(150)     | NOT NULL, UNIQUE    | Название типа                   |
| type_code     | STRING(100)     | NOT NULL, UNIQUE    | Код типа (артикул)              |
| price         | INTEGER         | NOT NULL            | Цена за единицу (в копейках?)   |

**Индексы:**  
- `idx_part_types_type_code` на `type_code`  

**Связи:**  
- `PartType.hasMany(Part)`  
- `PartType.hasMany(OrderItem)`

---

## Таблица `Order_Items` (модель `OrderItem`)  
Позиции заказа (какие типы деталей и в каком количестве требуются).

| Поле             | Тип              | Ограничения                       | Описание                         |
|------------------|------------------|-----------------------------------|----------------------------------|
| order_item_id    | INTEGER          | PRIMARY KEY, AUTO_INCREMENT      | Идентификатор позиции            |
| order_id         | INTEGER          | NOT NULL, FOREIGN KEY → Orders   | Заказ                            |
| part_type_id     | INTEGER          | NOT NULL, FOREIGN KEY → Part_Types | Тип детали                     |
| required_quantity| INTEGER          | NOT NULL, CHECK (min=1)          | Требуемое количество             |
| price            | DECIMAL(12,2)    |                                   | Цена (может переопределять цену типа) |

**Индексы:**  
- `idx_order_items` на `(order_id, required_quantity)`  

**Связи:**  
- `OrderItem.belongsTo(Order)`  
- `OrderItem.belongsTo(PartType)`  
- `OrderItem.hasMany(OrderItemPart)`

---

## Таблица `Parts` (модель `Part`)  
Конкретные экземпляры деталей.

| Поле              | Тип                          | Ограничения                       | Описание                         |
|-------------------|------------------------------|-----------------------------------|----------------------------------|
| part_id           | INTEGER                      | PRIMARY KEY, AUTO_INCREMENT      | Идентификатор детали             |
| serial_number     | STRING(100)                  | NOT NULL, UNIQUE                 | Серийный номер                   |
| batch_number      | STRING(100)                  |                                   | Номер партии                     |
| manufacture_date  | DATE                         | DEFAULT NOW                      | Дата изготовления                |
| sorted_at         | DATE                         |                                   | Дата сортировки (если выполнена) |
| warehouse_id      | INTEGER                      | FOREIGN KEY → Warehouse          | Склад, где находится             |
| qc_inspector_id   | INTEGER                      | FOREIGN KEY → Employee           | Инспектор, проверивший качество  |
| part_type_id      | INTEGER                      | NOT NULL, FOREIGN KEY → Part_Types | Тип детали                     |
| status            | ENUM('manufactured','sorted')| DEFAULT 'manufactured'           | Статус: произведена/отсортирована |

**Индексы:**  
- `idx_parts_search` на `(part_type_id, manufacture_date, serial_number, batch_number)`  

**Связи:**  
- `Part.belongsTo(Warehouse)`  
- `Part.belongsTo(Employee)` (как `qc_inspector_id`)  
- `Part.belongsTo(PartType)`  
- `Part.hasOne(OrderItemPart)`  
- `Part.hasMany(LoggingScans)`

---

## Таблица `Order_Item_Parts` (модель `OrderItemPart`)  
Связь между позицией заказа и конкретной деталью (какая деталь назначена на какую позицию).

| Поле              | Тип      | Ограничения                       | Описание                         |
|-------------------|----------|-----------------------------------|----------------------------------|
| order_item_part_id| INTEGER  | PRIMARY KEY, AUTO_INCREMENT      | Идентификатор связи              |
| order_item_id     | INTEGER  | NOT NULL, FOREIGN KEY → Order_Items | Позиция заказа                |
| part_id           | INTEGER  | NOT NULL, UNIQUE, FOREIGN KEY → Parts | Деталь (уникальна, т.е. одна деталь может быть назначена только на одну позицию) |

**Индексы:**  
- `idx_order_item_part` на `(order_item_id, part_id)`  

**Связи:**  
- `OrderItemPart.belongsTo(OrderItem)`  
- `OrderItemPart.belongsTo(Part)`

---

## Таблица `Cameras` (модель `Camera`)  
Камеры, используемые для сканирования.

| Поле              | Тип             | Ограничения         | Описание                         |
|-------------------|-----------------|---------------------|----------------------------------|
| camera_id         | INTEGER         | PRIMARY KEY, AUTO_INCREMENT | Идентификатор камеры           |
| name              | STRING(100)     | DEFAULT 'unnamed camera' | Название камеры               |
| resolution_height | INTEGER         | DEFAULT 480         | Высота разрешения (пикселей)    |
| resolution_width  | INTEGER         | DEFAULT 640         | Ширина разрешения (пикселей)    |
| frame_rate        | INTEGER         | DEFAULT 30          | Частота кадров (fps)            |
| is_active         | BOOLEAN         | DEFAULT true        | Активна ли камера               |
| created_at        | DATE            | Автоматически       | Дата создания                    |

**Индексы:** нет.  
**Связи:**  
- `Camera.hasMany(LoggingScans)`

---

## Таблица `Logging_Scans` (модель `LoggingScans`)  
Журнал сканирований (логи скан-кодов).

| Поле              | Тип                          | Ограничения                       | Описание                         |
|-------------------|------------------------------|-----------------------------------|----------------------------------|
| logging_scans_id  | INTEGER                      | PRIMARY KEY, AUTO_INCREMENT      | Идентификатор записи             |
| is_recovery       | BOOLEAN                      | DEFAULT false                     | (Устаревшее? См. `type_scan`)    |
| type_scan         | ENUM('CLEAR','RECOVERY')     | NOT NULL, DEFAULT 'CLEAR'        | Тип сканирования: чистое или восстановление |
| user_id           | INTEGER                      | NOT NULL, FOREIGN KEY → Employee | Сотрудник, выполнивший сканирование |
| camera_id         | INTEGER                      | NOT NULL, FOREIGN KEY → Cameras  | Камера, использованная для сканирования |
| part_id           | INTEGER                      | NOT NULL, FOREIGN KEY → Parts    | Отсканированная деталь           |
| created_at        | DATE                         | Автоматически                     | Дата и время сканирования        |

**Индексы:**  
- `idx_user_type_scan` на `(user_id, type_scan)`  
- `idx_part_type_created` на `(part_id, type_scan, created_at)`  
- `idx_part_id` на `part_id`  

**Связи:**  
- `LoggingScans.belongsTo(Employee)` (как `user_id`)  
- `LoggingScans.belongsTo(Part)`  
- `LoggingScans.belongsTo(Camera)`

---

## Схема связей (кратко)

- **Address** 1:N → Warehouse, Customer  
- **Warehouse** 1:N → Part  
- **Employee** 1:N → Shift, LoggingScans (user), Part (qc_inspector)  
- **Customer** 1:N → Order  
- **Order** 1:N → OrderItem  
- **PartType** 1:N → Part, OrderItem  
- **OrderItem** 1:N → OrderItemPart  
- **Part** 1:1 → OrderItemPart (как часть)  
- **Camera** 1:N → LoggingScans  

Все внешние ключи имеют ограничения `ON DELETE`/`ON UPDATE` (указаны в ассоциациях, в основном `RESTRICT` или `CASCADE`).

WebSocket не работает – убедитесь, что сервер поднимается на том же порту, и клиенты подключаются к ws://<host>:<port>.

Сборка Webpack выдаёт ошибки – проверьте версии Node.js и пакетов; попробуйте удалить node_modules и установить заново.

Скрипт start не находит bundle.js – см. раздел "Запуск собранного приложения" – используйте node dist/build.js или исправьте package.json.

Используемые технологии

Express – веб‑фреймворк

Sequelize – ORM для PostgreSQL

WebSocket (ws) – двусторонняя связь в реальном времени

Webpack – сборка для production

bcrypt – хеширование паролей

cors – кросс‑доменные запросы

dotenv-webpack – переменные окружения при сборке
