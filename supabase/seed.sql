-- Seed Services
insert into services (
    name,
    description,
    duration,
    price,
    category,
    color,
    icon
  )
values (
    'Strih vlasov',
    'Klasický strih s konzultáciou',
    30,
    15.00,
    'Vlasy',
    '#6366f1',
    '✂️'
  ),
  (
    'Farbenie vlasov',
    'Celofarbenie alebo melír',
    90,
    55.00,
    'Vlasy',
    '#8b5cf6',
    '🎨'
  ),
  (
    'Manikúra',
    'Kompletná starostlivosť o nechty',
    45,
    25.00,
    'Nechty',
    '#ec4899',
    '💅'
  ),
  (
    'Masáž',
    'Relaxačná masáž celého tela',
    60,
    40.00,
    'Wellness',
    '#10b981',
    '💆'
  ),
  (
    'Konzultácia',
    'Úvodná konzultácia zdarma',
    15,
    0.00,
    'Ostatné',
    '#06b6d4',
    '📋'
  );
-- Seed Mock Employees (Not linked to real users yet)
insert into employees (
    name,
    email,
    phone,
    color,
    services,
    working_hours
  )
values (
    'Jana Krásna',
    'jana@bookflow.sk',
    '+421 900 111 111',
    '#f59e0b',
    (
      select jsonb_agg(id)
      from services
      where name in ('Strih vlasov', 'Farbenie vlasov')
    ),
    '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "15:00"}}'::jsonb
  ),
  (
    'Peter Šikovný',
    'peter@bookflow.sk',
    '+421 900 222 222',
    '#3b82f6',
    (
      select jsonb_agg(id)
      from services
      where name in ('Strih vlasov', 'Manikúra', 'Masáž')
    ),
    '{"monday": {"start": "10:00", "end": "18:00"}, "tuesday": {"start": "10:00", "end": "18:00"}, "wednesday": {"start": "10:00", "end": "18:00"}, "thursday": {"start": "10:00", "end": "18:00"}, "friday": {"start": "10:00", "end": "18:00"}, "saturday": {"start": "09:00", "end": "13:00"}}'::jsonb
  );