-- Add weight_kg column to products table
-- Run this once on production: mysql -u root sholok_ecommerce < add_product_weight.sql
ALTER TABLE products
  ADD COLUMN weight_kg DECIMAL(8,3) NOT NULL DEFAULT 0.500 AFTER shipping_charge;
