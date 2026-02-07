-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'customer' check (role in ('admin', 'employee', 'customer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Locations
create table locations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  phone text,
  email text,
  business_hours jsonb, -- { "monday": { "start": "09:00", "end": "17:00" } }
  coordinates jsonb, -- { "lat": 48.1, "lng": 17.1 }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Services
create table services (
  id uuid default uuid_generate_v4() primary key,
  location_id uuid references locations(id) on delete cascade not null,
  name text not null,
  description text,
  duration integer not null, -- minutes
  price numeric(10,2) not null,
  category text,
  color text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Employees
create table employees (
  id uuid default uuid_generate_v4() primary key,
  location_id uuid references locations(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  services text[], -- Array of service IDs they can perform
  working_hours jsonb,
  color text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Bookings
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references auth.users(id), -- Nullable for guest bookings if needed
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  employee_id uuid references employees(id) not null,
  service_id uuid references services(id) not null,
  location_id uuid references locations(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  price numeric(10,2),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table locations enable row level security;
alter table services enable row level security;
alter table employees enable row level security;
alter table bookings enable row level security;

-- Public Read Access for Reference Data
create policy "Public locations are viewable by everyone" on locations for select using (true);
create policy "Public services are viewable by everyone" on services for select using (true);
create policy "Public employees are viewable by everyone" on employees for select using (true);

-- Bookings Policies
create policy "Users can view their own bookings" on bookings for select
  using (auth.uid() = customer_id);

create policy "Admins and Employees view all bookings" on bookings for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and role in ('admin', 'employee')
    )
  );

create policy "Anyone can insert bookings" on bookings for insert
  with check (true); -- Allow guest bookings logic to be handled by API/Edge Function ideally, but for now open for app

-- Profiles Policies
create policy "Users can view own profile" on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile" on profiles for update
  using (auth.uid() = id);