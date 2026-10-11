import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const code = fs.readFileSync('lib/default-data.ts', 'utf8');
  
  const categoriesRegex = /export const DEFAULT_CATEGORIES: Category\[\] = (\[[\s\S]*?\]);/m;
  const matchCat = code.match(categoriesRegex);
  if (matchCat) {
    const arr = eval(matchCat[1]);
    for(const c of arr) {
      await supabase.from('categories').upsert(c);
    }
    console.log("Categories done");
  }

  const productsRegex = /export const DEFAULT_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/m;
  const matchProd = code.match(productsRegex);
  if (matchProd) {
    const arr = eval(matchProd[1]);
    for(const p of arr) {
      await supabase.from('products').upsert(p);
    }
    console.log("Products done");
  }

  const slidersRegex = /export const DEFAULT_SLIDERS: Slider\[\] = (\[[\s\S]*?\]);/m;
  const matchSlider = code.match(slidersRegex);
  if (matchSlider) {
    const arr = eval(matchSlider[1]);
    for(const s of arr) {
      await supabase.from('sliders').upsert(s);
    }
    console.log("Sliders done");
  }
}

run();
