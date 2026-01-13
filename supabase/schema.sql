-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  role text check (
    role in ('admin', 'manager', 'employee', 'customer')
  ) default 'customer',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- SERVICES
create table services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  duration integer not null,
  -- minutes
  price numeric not null,
  category text,
  color text,
  icon text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- EMPLOYEES
create table employees (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  -- Link to auth user if they have login
  name text not null,
  email text,
  phone text,
  avatar_url text,
  color text,
  services text [],
  -- Array of service IDs
  working_hours jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- BOOKINGS
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references auth.users,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  employee_id uuid references employees(id),
  service_id uuid references services(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  duration integer not null,
  price numeric not null,
  status text check (
    status in (
      'pending',
      'confirmed',
      'completed',
      'cancelled',
      'no-show'
    )
  ) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- RLS POLICIES (Basic Setup)
alter table profiles enable row level security;
alter table services enable row level security;
alter table employees enable row level security;
alter table bookings enable row level security;
-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone" on profiles for
select using (true);
create policy "Users can update own profile" on profiles for
update using (auth.uid() = id);
-- Services: Public read, Admin only write (implied)
create policy "Services are viewable by everyone" on services for
select using (true);
-- Employees: Public read, Admin only write (implied)
create policy "Employees are viewable by everyone" on employees for
select using (true);
-- Bookings: Users can see their own bookings, Staff can see all
create policy "Users can view own bookings" on bookings for
select using (auth.uid() = customer_id);
create policy "Users can create bookings" on bookings for
insert with check (auth.uid() = customer_id);