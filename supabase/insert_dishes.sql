-- SQL запрос для добавления всех блюд из menu.json в Supabase
-- Выполните этот запрос в Supabase SQL Editor

INSERT INTO dishes (name, category) VALUES
  -- Breakfast
  ('Vegetable Omelet', 'breakfast'),
  ('Oatmeal with Fruits', 'breakfast'),
  ('Pancakes with Berries', 'breakfast'),
  ('Scrambled Eggs with Bacon', 'breakfast'),
  ('Cottage Cheese with Honey', 'breakfast'),
  ('Avocado Toast', 'breakfast'),
  ('Cheese Pancakes', 'breakfast'),
  ('Buckwheat Porridge', 'breakfast'),
  
  -- Lunch
  ('Caesar Salad', 'lunch'),
  ('Borscht', 'lunch'),
  ('Carbonara Pasta', 'lunch'),
  ('Chicken Soup', 'lunch'),
  ('Greek Salad', 'lunch'),
  ('Pilaf', 'lunch'),
  ('Fish Soup', 'lunch'),
  ('Lasagna', 'lunch'),
  
  -- Dinner
  ('Grilled Salmon', 'dinner'),
  ('Steak with Vegetables', 'dinner'),
  ('Steamed Vegetables', 'dinner'),
  ('Roasted Chicken', 'dinner'),
  ('Baked Fish', 'dinner'),
  ('Vegetable Stew', 'dinner'),
  ('Cutlets with Side Dish', 'dinner'),
  ('Shish Kebab', 'dinner')
ON CONFLICT (name, category) DO NOTHING;
