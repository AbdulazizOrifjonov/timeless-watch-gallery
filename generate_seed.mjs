import fs from 'fs';
import crypto from 'crypto';

const code = fs.readFileSync('lib/default-data.ts', 'utf8');

const mC = code.match(/export const DEFAULT_CATEGORIES: Category\[\] = (\[[\s\S]*?\]);/m);
const mP = code.match(/export const DEFAULT_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/m);
const mS = code.match(/export const DEFAULT_SLIDERS: Slider\[\] = (\[[\s\S]*?\]);/m);

const idMap = {};
function getUuid(oldId) {
  if (!oldId) return '00000000-0000-0000-0000-000000000000';
  if (!idMap[oldId]) {
    const hash = crypto.createHash('md5').update(oldId).digest('hex');
    idMap[oldId] = `${hash.substr(0,8)}-${hash.substr(8,4)}-${hash.substr(12,4)}-${hash.substr(16,4)}-${hash.substr(20,12)}`;
  }
  return idMap[oldId];
}

function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return str.toString().replace(/'/g, "''");
}

let sql = '-- UZO ELEKTRO MARKET SEED DATA (Clean User Data)\n\n';

sql += 'DELETE FROM product_images;\n';
sql += 'DELETE FROM products;\n';

if (mC) {
  const cats = eval(mC[1]);
  for (let c of cats) {
    const isActive = c.is_active === false ? false : true;
    sql += `INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES ('${getUuid(c.id)}', '${escapeSql(c.name)}', '${escapeSql(c.slug)}', '${escapeSql(c.description)}', '${escapeSql(c.image_url)}', ${isActive}) ON CONFLICT (id) DO NOTHING;\n`;
  }
}

if (mP) {
  const prods = eval(mP[1]);
  for (let p of prods) {
    const price = p.price || 0;
    const oldPrice = (p.old_price !== undefined && p.old_price !== null) ? p.old_price : 'NULL';
    const discount = (p.discount !== undefined && p.discount !== null) ? p.discount : 'NULL';
    const stock = p.stock || 0;
    const rating = p.rating || 0;
    const reviewsCount = p.reviews_count || 0;
    const isActive = p.is_active === false ? false : true;
    const isFeatured = p.is_featured === true ? true : false;
    const isNew = p.is_new === true ? true : false;
    
    sql += `INSERT INTO products (id, name, slug, description, price, old_price, discount, category_id, brand, stock, sku, rating, reviews_count, image, is_active, is_featured, is_new, specifications) VALUES ('${getUuid(p.id)}', '${escapeSql(p.name)}', '${escapeSql(p.slug)}', '${escapeSql(p.description)}', ${price}, ${oldPrice}, ${discount}, '${getUuid(p.category_id)}', '${escapeSql(p.brand)}', ${stock}, '${escapeSql(p.sku)}', ${rating}, ${reviewsCount}, '${escapeSql(p.image)}', ${isActive}, ${isFeatured}, ${isNew}, '${escapeSql(JSON.stringify(p.specifications || {}))}'::jsonb) ON CONFLICT (id) DO NOTHING;\n`;
    
    if (p.images) {
      for (let i of p.images) {
        const sortOrder = i.sort_order || 0;
        sql += `INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('${getUuid(i.id)}', '${getUuid(p.id)}', '${escapeSql(i.url)}', ${sortOrder}) ON CONFLICT (id) DO NOTHING;\n`;
      }
    }
  }
}

if (mS) {
  const sl = eval(mS[1]);
  for (let s of sl) {
    const isActive = s.is_active === false ? false : true;
    const sortOrder = s.sort_order || 0;
    sql += `INSERT INTO sliders (id, title, subtitle, image_url, button_text, link, sort_order, is_active) VALUES ('${escapeSql(s.id)}', '${escapeSql(s.title)}', '${s.subtitle ? escapeSql(s.subtitle) : 'system'}', '${escapeSql(s.image_url)}', '${escapeSql(s.button_text)}', '${escapeSql(s.link)}', ${sortOrder}, ${isActive}) ON CONFLICT (id) DO NOTHING;\n`;
  }
}

fs.writeFileSync('supabase/seed.sql', sql);
console.log('Final seed.sql created successfully!');
