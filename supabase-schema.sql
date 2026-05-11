-- Supabase schema for Biblioteca ITSON

-- 1) Profiles table: guarda datos del usuario asociados al auth user de Supabase
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  student_id text unique not null,
  name text not null,
  role text not null default 'student'
);

-- 2) Resources table: catálogo de cubículos y PCs
create table if not exists resources (
  id text primary key,
  name text not null,
  type text not null,
  status text not null default 'available',
  location text not null,
  capacity text
);

-- 3) Reservations table: reservas hechas por usuarios
create table if not exists reservations (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  resource_id text not null references resources(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- 4) Notifications table: opcional para avisos de reservas
create table if not exists notifications (
  id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  type text not null default 'reminder'
);

-- Opcional: datos iniciales de recursos
insert into resources (id, name, type, status, location, capacity) values
  ('c1', 'Cubículo 1', 'cubicle', 'available', 'Segundo Piso - Zona A', '4-6 personas'),
  ('c2', 'Cubículo 2', 'cubicle', 'available', 'Segundo Piso - Zona A', '4-6 personas'),
  ('c3', 'Cubículo 3', 'cubicle', 'available', 'Segundo Piso - Zona A', '4-6 personas'),
  ('c4', 'Cubículo 4', 'cubicle', 'available', 'Segundo Piso - Zona A', '4-6 personas'),
  ('c5', 'Cubículo 5', 'cubicle', 'available', 'Segundo Piso - Zona A', '4-6 personas'),
  ('c6', 'Cubículo 6', 'cubicle', 'available', 'Segundo Piso - Zona A', '4-6 personas'),
  ('c7', 'Cubículo 7', 'cubicle', 'available', 'Segundo Piso - Zona B', '4-6 personas'),
  ('c8', 'Cubículo 8', 'cubicle', 'available', 'Segundo Piso - Zona B', '4-6 personas'),
  ('p1', 'PC-01', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p2', 'PC-02', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p3', 'PC-03', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p4', 'PC-04', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p5', 'PC-05', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p6', 'PC-06', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p7', 'PC-07', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p8', 'PC-08', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p9', 'PC-09', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p10', 'PC-10', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p11', 'PC-11', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p12', 'PC-12', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p13', 'PC-13', 'computer', 'available', 'Segundo Piso - Área Virtual', null),
  ('p14', 'PC-14', 'computer', 'available', 'Segundo Piso - Área Virtual', null)
on conflict (id) do nothing;
