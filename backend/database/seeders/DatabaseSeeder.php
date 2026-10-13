<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Size;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Ensure Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
        if ($admin->role !== 'admin') {
            $admin->role = 'admin';
            $admin->save();
        }

        // 2. Default Sizes
        $sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        $sizeModels = [];
        foreach ($sizesList as $name) {
            $sizeModels[$name] = Size::firstOrCreate(['name' => $name]);
        }

        // 3. Default Categories
        $categoriesList = [
            'Footwear' => 1,
            'Fashion & Apparel' => 1,
            'Electronics' => 1,
            'Watches & Accessories' => 1,
            'Home & Living' => 1,
        ];
        $categoryModels = [];
        foreach ($categoriesList as $name => $status) {
            $categoryModels[$name] = Category::firstOrCreate(['name' => $name], ['status' => $status]);
        }

        // 4. Default Brands
        $brandsList = [
            'Nike' => 1,
            'Apple' => 1,
            'Sony' => 1,
            'Adidas' => 1,
            'Samsung' => 1,
            'Puma' => 1,
        ];
        $brandModels = [];
        foreach ($brandsList as $name => $status) {
            $brandModels[$name] = Brand::firstOrCreate(['name' => $name], ['status' => $status]);
        }

        // 5. Seed Products if empty
        if (Product::count() === 0) {
            $sampleProducts = [
                [
                    'title' => 'Nike Air Max Pulse 2026',
                    'price' => 149.99,
                    'compare_price' => 189.99,
                    'category' => 'Footwear',
                    'brand' => 'Nike',
                    'sku' => 'NK-AMP-001',
                    'qty' => 45,
                    'status' => 1,
                    'is_featured' => 'yes',
                    'short_description' => 'Ultra-cushioned responsive running sneakers with breathable mesh upper and dynamic Air unit.',
                    'description' => 'The Nike Air Max Pulse pulls inspiration from the London music scene, bringing an underground touch to the iconic Air Max line. Point-loaded cushioning system uses a plastic clip to distribute weight to targeted points for an elevated bounce feel.',
                    'sizes' => ['S', 'M', 'L', 'XL'],
                ],
                [
                    'title' => 'Apple AirPods Max (USB-C)',
                    'price' => 549.00,
                    'compare_price' => 599.00,
                    'category' => 'Electronics',
                    'brand' => 'Apple',
                    'sku' => 'APL-APM-002',
                    'qty' => 20,
                    'status' => 1,
                    'is_featured' => 'yes',
                    'short_description' => 'Over-ear headphones with high-fidelity audio, Active Noise Cancellation, and Spatial Audio.',
                    'description' => 'AirPods Max reimagine over-ear headphones. An Apple-designed dynamic driver provides immersive high-fidelity audio. Every detail, from canopy to cushions, has been designed for an exceptional acoustic fit.',
                    'sizes' => [],
                ],
                [
                    'title' => 'Sony WH-1000XM5 Wireless Headphones',
                    'price' => 398.00,
                    'compare_price' => 449.99,
                    'category' => 'Electronics',
                    'brand' => 'Sony',
                    'sku' => 'SNY-XM5-003',
                    'qty' => 35,
                    'status' => 1,
                    'is_featured' => 'yes',
                    'short_description' => 'Industry-leading noise canceling with two processors and 8 microphones for crystal clarity.',
                    'description' => 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control multiple microphones for unprecedented noise canceling while Auto NC Optimizer automatically optimizes noise canceling based on your wearing conditions.',
                    'sizes' => [],
                ],
                [
                    'title' => 'Adidas Ultraboost Light Running Shoes',
                    'price' => 189.99,
                    'compare_price' => 219.99,
                    'category' => 'Footwear',
                    'brand' => 'Adidas',
                    'sku' => 'ADI-UB-004',
                    'qty' => 50,
                    'status' => 1,
                    'is_featured' => 'no',
                    'short_description' => 'Lightest Ultraboost ever made with 30% lighter Boost material for maximum energy return.',
                    'description' => 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST. Its unique molecular design achieves the lightest BOOST foam to date.',
                    'sizes' => ['M', 'L', 'XL'],
                ],
                [
                    'title' => 'Samsung Galaxy Watch Ultra 47mm',
                    'price' => 649.99,
                    'compare_price' => 699.99,
                    'category' => 'Watches & Accessories',
                    'brand' => 'Samsung',
                    'sku' => 'SMS-GWU-005',
                    'qty' => 15,
                    'status' => 1,
                    'is_featured' => 'yes',
                    'short_description' => 'Rugged titanium cushion-design smartwatch with dual-frequency GPS and advanced biometric sensors.',
                    'description' => 'Push past boundaries with Galaxy Watch Ultra. Built with Grade 4 Titanium and sapphire crystal glass, it withstands temperatures from -20°C to 55°C and offers up to 100 hours of battery life in power saving mode.',
                    'sizes' => [],
                ],
                [
                    'title' => 'Puma T7 Vintage Track Jacket',
                    'price' => 79.99,
                    'compare_price' => 99.99,
                    'category' => 'Fashion & Apparel',
                    'brand' => 'Puma',
                    'sku' => 'PMA-T7-006',
                    'qty' => 60,
                    'status' => 1,
                    'is_featured' => 'no',
                    'short_description' => 'Classic streetwear heritage track jacket featuring signature 7cm stripes and athletic fit.',
                    'description' => 'A statement piece from the PUMA archives, the T7 jacket has been redefined for modern city style. Crafted from soft cotton-blend tricot with iconic panel inserts along the sleeves.',
                    'sizes' => ['S', 'M', 'L', 'XL'],
                ],
            ];

            foreach ($sampleProducts as $item) {
                $product = Product::create([
                    'title' => $item['title'],
                    'price' => $item['price'],
                    'compare_price' => $item['compare_price'],
                    'category_id' => $categoryModels[$item['category']]->id,
                    'brand_id' => $brandModels[$item['brand']]->id,
                    'sku' => $item['sku'],
                    'qty' => $item['qty'],
                    'status' => $item['status'],
                    'is_featured' => $item['is_featured'],
                    'short_description' => $item['short_description'],
                    'description' => $item['description'],
                ]);

                foreach ($item['sizes'] as $sName) {
                    if (isset($sizeModels[$sName])) {
                        ProductSize::create([
                            'product_id' => $product->id,
                            'size_id' => $sizeModels[$sName]->id,
                        ]);
                    }
                }
            }
        }
    }
}
