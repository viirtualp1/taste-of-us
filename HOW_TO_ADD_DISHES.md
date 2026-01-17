# Как добавить блюда в Supabase

Есть несколько способов добавить блюда в базу данных Supabase:

## Способ 1: Через API endpoint (рекомендуется)

Используйте POST запрос к `/api/dishes`:

```bash
curl -X POST http://localhost:3000/api/dishes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Название блюда",
    "category": "brunch",
    "cuisine": "asian"
  }'
```

Или через JavaScript:

```javascript
await $fetch('/api/dishes', {
  method: 'POST',
  body: {
    name: 'Название блюда',
    category: 'brunch', // или 'dinner'
    cuisine: 'asian', // опционально: 'asian', 'european', 'slavic'
  },
})
```

## Способ 2: Через Supabase SQL Editor

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в SQL Editor
3. **ВАЖНО: Сначала выполните очистку и миграцию** (если у вас уже есть данные):

```sql
-- Добавить колонку cuisine, если её нет
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS cuisine TEXT CHECK (cuisine IN ('asian', 'european', 'slavic', NULL));

-- Обновить constraint для category, если нужно
ALTER TABLE dishes
DROP CONSTRAINT IF EXISTS dishes_category_check;

ALTER TABLE dishes
ADD CONSTRAINT dishes_category_check
CHECK (category IN ('breakfast', 'lunch', 'dinner', 'brunch'));

-- Создать индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_dishes_cuisine ON dishes(cuisine);
```

4. **Затем выполните очистку дубликатов** (если у вас уже есть данные):

```sql
-- Шаг 1: Удалить записи с breakfast/lunch, которые после миграции создадут дубликаты с существующими brunch
DELETE FROM dishes d1
WHERE d1.category IN ('breakfast', 'lunch')
AND EXISTS (
  SELECT 1
  FROM dishes d2
  WHERE d2.name = d1.name
  AND d2.category = 'brunch'
);

-- Шаг 2: Теперь безопасно мигрировать оставшиеся breakfast и lunch в brunch
UPDATE dishes
SET category = 'brunch'
WHERE category IN ('breakfast', 'lunch');

-- Шаг 3: Удалить оставшиеся дубликаты (на всякий случай)
-- Оставляет запись с самым ранним created_at для каждой комбинации name + category
WITH ranked_dishes AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY created_at ASC) as rn
  FROM dishes
)
DELETE FROM dishes
WHERE id IN (
  SELECT id FROM ranked_dishes WHERE rn > 1
);
```

5. **Теперь выполните запрос для добавления блюд:**

```sql
INSERT INTO dishes (name, category, cuisine) VALUES
  -- Brunch - Asian
  ('Vegetable Omelet', 'brunch', 'asian'),
  ('Oatmeal with Fruits', 'brunch', 'asian'),
  ('Pancakes with Berries', 'brunch', 'asian'),

  -- Brunch - European
  ('Scrambled Eggs with Bacon', 'brunch', 'european'),
  ('Avocado Toast', 'brunch', 'european'),
  ('Cottage Cheese with Honey', 'brunch', 'european'),

  -- Brunch - Slavic
  ('Cheese Pancakes', 'brunch', 'slavic'),
  ('Buckwheat Porridge', 'brunch', 'slavic'),

  -- Brunch - Mixed (from lunch category)
  ('Caesar Salad', 'brunch', 'european'),
  ('Greek Salad', 'brunch', 'european'),
  ('Borscht', 'brunch', 'slavic'),
  ('Carbonara Pasta', 'brunch', 'european'),
  ('Chicken Soup', 'brunch', 'slavic'),
  ('Pilaf', 'brunch', 'asian'),
  ('Fish Soup', 'brunch', 'slavic'),
  ('Lasagna', 'brunch', 'european'),

  -- Dinner - Asian
  ('Steamed Vegetables', 'dinner', 'asian'),
  ('Grilled Salmon', 'dinner', 'asian'),

  -- Dinner - European
  ('Steak with Vegetables', 'dinner', 'european'),
  ('Roasted Chicken', 'dinner', 'european'),
  ('Baked Fish', 'dinner', 'european'),

  -- Dinner - Slavic
  ('Vegetable Stew', 'dinner', 'slavic'),
  ('Cutlets with Side Dish', 'dinner', 'slavic'),
  ('Shish Kebab', 'dinner', 'slavic')
ON CONFLICT (name, category) DO NOTHING;
```

**Или если вы не хотите добавлять колонку `cuisine` прямо сейчас, используйте упрощенный запрос:**

```sql
INSERT INTO dishes (name, category) VALUES
  -- Brunch
  ('Vegetable Omelet', 'brunch'),
  ('Oatmeal with Fruits', 'brunch'),
  ('Pancakes with Berries', 'brunch'),
  ('Scrambled Eggs with Bacon', 'brunch'),
  ('Avocado Toast', 'brunch'),
  ('Cottage Cheese with Honey', 'brunch'),
  ('Cheese Pancakes', 'brunch'),
  ('Buckwheat Porridge', 'brunch'),
  ('Caesar Salad', 'brunch'),
  ('Greek Salad', 'brunch'),
  ('Borscht', 'brunch'),
  ('Carbonara Pasta', 'brunch'),
  ('Chicken Soup', 'brunch'),
  ('Pilaf', 'brunch'),
  ('Fish Soup', 'brunch'),
  ('Lasagna', 'brunch'),

  -- Dinner
  ('Steamed Vegetables', 'dinner'),
  ('Grilled Salmon', 'dinner'),
  ('Steak with Vegetables', 'dinner'),
  ('Roasted Chicken', 'dinner'),
  ('Baked Fish', 'dinner'),
  ('Vegetable Stew', 'dinner'),
  ('Cutlets with Side Dish', 'dinner'),
  ('Shish Kebab', 'dinner')
ON CONFLICT (name, category) DO NOTHING;
```

## Способ 3: Через Supabase Table Editor

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в Table Editor
3. Выберите таблицу `dishes`
4. Нажмите "Insert row"
5. Заполните поля:
   - `name`: название блюда (обязательно)
   - `category`: 'brunch' или 'dinner' (обязательно)
   - `cuisine`: 'asian', 'european', 'slavic' или оставьте пустым (опционально)

## Доступные категории (category)

- `brunch` - для бранча
- `dinner` - для ужина

## Доступные кухни (cuisine)

- `asian` - Азиатская кухня
- `european` - Европейская кухня
- `slavic` - Славянская кухня
- `null` или не указано - без категории кухни

## Примеры блюд

```sql
INSERT INTO dishes (name, category, cuisine) VALUES
  ('Sushi Roll', 'brunch', 'asian'),
  ('Pasta Carbonara', 'dinner', 'european'),
  ('Borscht', 'brunch', 'slavic'),
  ('Pad Thai', 'dinner', 'asian'),
  ('Beef Stroganoff', 'dinner', 'slavic'),
  ('Pizza Margherita', 'brunch', 'european')
ON CONFLICT (name, category) DO NOTHING;
```

## Очистка дубликатов (ВАЖНО: выполните перед добавлением блюд!)

Если у вас уже есть блюда в базе данных и вы получаете ошибку о дубликатах, **сначала выполните этот запрос**:

```sql
-- Шаг 1: Удалить записи с breakfast/lunch, которые после миграции создадут дубликаты с существующими brunch
DELETE FROM dishes d1
WHERE d1.category IN ('breakfast', 'lunch')
AND EXISTS (
  SELECT 1
  FROM dishes d2
  WHERE d2.name = d1.name
  AND d2.category = 'brunch'
);

-- Шаг 2: Теперь безопасно мигрировать оставшиеся breakfast и lunch в brunch
UPDATE dishes
SET category = 'brunch'
WHERE category IN ('breakfast', 'lunch');

-- Шаг 3: Удалить оставшиеся дубликаты (на всякий случай)
-- Оставляет запись с самым ранним created_at для каждой комбинации name + category
WITH ranked_dishes AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY created_at ASC) as rn
  FROM dishes
)
DELETE FROM dishes
WHERE id IN (
  SELECT id FROM ranked_dishes WHERE rn > 1
);
```

**После выполнения этого запроса вы сможете добавить новые блюда без ошибок.**

## Примечания

- Поле `id` создается автоматически (UUID)
- Поля `created_at` и `updated_at` заполняются автоматически
- Если блюдо с таким же `name` и `category` уже существует, оно не будет добавлено (благодаря уникальному индексу)
- API endpoint автоматически убирает дубликаты при возврате данных
- API endpoint автоматически убирает дубликаты при возврате данных
