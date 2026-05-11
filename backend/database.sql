-- ============================================
-- Base de datos: garin_steakhouse
-- ============================================

CREATE DATABASE IF NOT EXISTS garin_steakhouse
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE garin_steakhouse;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (username, password, nombre, rol) VALUES
  ('admin', 'admin123', 'Administrador', 'admin'),
  ('empleado1', 'emp123', 'Dana Garín', 'empleado');

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO proveedores (nombre, contacto, telefono) VALUES
  ('Carnes del Norte', 'Juan Pérez', '33-1234-5678'),
  ('Distribuidora GDL', 'María López', '33-8765-4321'),
  ('Frigorífico Jalisco', 'Carlos Ruiz', '33-5555-1234'),
  ('Proveedora Premium', 'Ana Torres', '33-9999-8888');

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  imageURL VARCHAR(500),
  category VARCHAR(100),
  description TEXT,
  inStock INT NOT NULL DEFAULT 0,
  proveedor VARCHAR(100),
  proveedor_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
);

INSERT INTO productos (name, price, imageURL, category, description, inStock, proveedor, proveedor_id) VALUES
  ('Ribeye 400g', 380.00, 'assets/ribeye.jpg', 'Cortes', 'Corte jugoso con gran marmoleo, ideal para la parrilla.', 15, 'Carnes del Norte', 1),
  ('New York Strip 350g', 320.00, 'assets/newyork.jpg', 'Cortes', 'Corte firme con sabor intenso, perfecto al término medio.', 12, 'Carnes del Norte', 1),
  ('T-Bone 500g', 420.00, 'assets/tbone.jpg', 'Cortes', 'Clásico corte con hueso, dos texturas en un solo plato.', 8, 'Frigorífico Jalisco', 3),
  ('Arrachera 300g', 220.00, 'assets/arrachera.jpg', 'Cortes', 'Corte marinado tradicional, suave y lleno de sabor.', 20, 'Distribuidora GDL', 2),
  ('Filete Mignon 250g', 450.00, 'assets/filete.jpg', 'Cortes Premium', 'El corte más tierno del ganado, de sabor delicado.', 10, 'Proveedora Premium', 4),
  ('Ensalada César', 95.00, 'assets/ensalada.jpg', 'Entradas', 'Lechuga romana, crutones, parmesano y aderezo César.', 25, 'Distribuidora GDL', 2),
  ('Papas a la francesa', 65.00, 'assets/papas.jpg', 'Acompañamientos', 'Papas doradas y crujientes con sal de mar.', 30, 'Distribuidora GDL', 2),
  ('Agua mineral 600ml', 35.00, 'assets/agua.jpg', 'Bebidas', 'Agua mineral natural con o sin gas.', 50, 'Distribuidora GDL', 2);

-- ============================================
-- TABLA: tickets
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  responsable VARCHAR(100) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: ticket_items
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  producto VARCHAR(150) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total_linea DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Tickets de ejemplo
INSERT INTO tickets (fecha, responsable, cantidad) VALUES
  ('2025-05-01', 'Dana Garín', 895.00),
  ('2025-05-03', 'Admin', 1240.50),
  ('2025-05-07', 'Dana Garín', 540.00);

INSERT INTO ticket_items (ticket_id, producto, cantidad, precio_unitario, total_linea) VALUES
  (1, 'Ribeye 400g', 1, 380.00, 380.00),
  (1, 'Papas a la francesa', 2, 65.00, 130.00),
  (1, 'Agua mineral 600ml', 2, 35.00, 70.00),
  (2, 'Filete Mignon 250g', 1, 450.00, 450.00),
  (2, 'T-Bone 500g', 1, 420.00, 420.00),
  (2, 'Ensalada César', 1, 95.00, 95.00),
  (3, 'Arrachera 300g', 1, 220.00, 220.00),
  (3, 'New York Strip 350g', 1, 320.00, 320.00);
