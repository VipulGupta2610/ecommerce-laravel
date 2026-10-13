<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Models\TempImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductController extends Controller
{
    // List products with optional search, filtering and sorting
    public function index(Request $request)
    {
        $query = Product::with(['product_images', 'category', 'brand', 'sizes']);

        // Search by keyword
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by brand
        if ($request->has('brand_id') && !empty($request->brand_id)) {
            $query->where('brand_id', $request->brand_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== null && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by featured
        if ($request->has('is_featured') && !empty($request->is_featured)) {
            $query->where('is_featured', $request->is_featured);
        }

        // Price range
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'ASC');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'DESC');
                    break;
                case 'title_asc':
                    $query->orderBy('title', 'ASC');
                    break;
                default:
                    $query->orderBy('created_at', 'DESC');
                    break;
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        $products = $query->get();

        return response()->json([
            'status' => 200,
            'products' => $products,
            'data' => $products,
        ], 200);
    }

    // Store a new product
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|integer|exists:categories,id',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'sku' => 'required|string|max:100|unique:products,sku',
            'is_featured' => 'required|in:yes,no',
            'status' => 'required|integer',
            'qty' => 'nullable|integer',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'gallery' => 'nullable|array',
            'sizes' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $product = new Product();
        $product->title = $request->title;
        $product->price = $request->price;
        $product->compare_price = $request->compare_price;
        $product->category_id = $request->category_id;
        $product->brand_id = $request->brand_id;
        $product->sku = $request->sku;
        $product->barcode = $request->barcode;
        $product->qty = $request->qty ?? 0;
        $product->description = $request->description;
        $product->short_description = $request->short_description;
        $product->status = $request->status;
        $product->is_featured = $request->is_featured;
        $product->save();

        // Process Gallery Images
        $this->processGalleryImages($product, $request->gallery);

        // Process Sizes
        if (!empty($request->sizes) && is_array($request->sizes)) {
            foreach ($request->sizes as $sizeId) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size_id' => $sizeId,
                ]);
            }
        }

        $product->load(['product_images', 'category', 'brand', 'sizes']);

        return response()->json([
            'status' => 201,
            'message' => 'Product has been created successfully',
            'data' => $product,
        ], 201);
    }

    // Show a single product
    public function show($id)
    {
        $product = Product::with(['product_images', 'category', 'brand', 'sizes'])->find($id);

        if ($product === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $product,
            'product' => $product,
        ], 200);
    }

    // Update product
    public function update($id, Request $request)
    {
        $product = Product::find($id);

        if ($product === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|integer|exists:categories,id',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'sku' => 'required|string|max:100|unique:products,sku,' . $id . ',id',
            'is_featured' => 'required|in:yes,no',
            'status' => 'required|integer',
            'qty' => 'nullable|integer',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'gallery' => 'nullable|array',
            'sizes' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $product->title = $request->title;
        $product->price = $request->price;
        $product->compare_price = $request->compare_price;
        $product->category_id = $request->category_id;
        $product->brand_id = $request->brand_id;
        $product->sku = $request->sku;
        $product->barcode = $request->barcode;
        $product->qty = $request->qty ?? $product->qty;
        $product->description = $request->description;
        $product->short_description = $request->short_description;
        $product->status = $request->status;
        $product->is_featured = $request->is_featured;
        $product->save();

        // Process any new Gallery Images
        if (!empty($request->gallery)) {
            $this->processGalleryImages($product, $request->gallery);
        }

        // Sync Sizes if provided
        if ($request->has('sizes') && is_array($request->sizes)) {
            ProductSize::where('product_id', $product->id)->delete();
            foreach ($request->sizes as $sizeId) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size_id' => $sizeId,
                ]);
            }
        }

        $product->load(['product_images', 'category', 'brand', 'sizes']);

        return response()->json([
            'status' => 200,
            'message' => 'Product has been updated successfully',
            'data' => $product,
        ], 200);
    }

    // Delete product and its images
    public function destroy($id)
    {
        $product = Product::with('product_images')->find($id);

        if ($product === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        }

        // Delete image files
        foreach ($product->product_images as $pImage) {
            $smallPath = public_path('uploads/products/small/' . $pImage->image);
            $largePath = public_path('uploads/products/large/' . $pImage->image);
            if (File::exists($smallPath)) {
                File::delete($smallPath);
            }
            if (File::exists($largePath)) {
                File::delete($largePath);
            }
        }

        // Delete featured image if distinct
        if ($product->image) {
            $smallPath = public_path('uploads/products/small/' . $product->image);
            $largePath = public_path('uploads/products/large/' . $product->image);
            if (File::exists($smallPath)) {
                File::delete($smallPath);
            }
            if (File::exists($largePath)) {
                File::delete($largePath);
            }
        }

        $product->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Product has been deleted successfully',
        ], 200);
    }

    // Delete single product gallery image
    public function destroyImage($id)
    {
        $productImage = ProductImage::find($id);

        if ($productImage === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Image not found',
            ], 404);
        }

        $smallPath = public_path('uploads/products/small/' . $productImage->image);
        $largePath = public_path('uploads/products/large/' . $productImage->image);

        if (File::exists($smallPath)) {
            File::delete($smallPath);
        }
        if (File::exists($largePath)) {
            File::delete($largePath);
        }

        $product = Product::find($productImage->product_id);
        if ($product && $product->image === $productImage->image) {
            $nextImage = ProductImage::where('product_id', $product->id)
                ->where('id', '!=', $productImage->id)
                ->first();
            $product->image = $nextImage ? $nextImage->image : null;
            $product->save();
        }

        $productImage->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Image deleted successfully',
        ], 200);
    }

    // Helper: process gallery images from temp uploads
    private function processGalleryImages(Product $product, ?array $gallery)
    {
        if (empty($gallery)) {
            return;
        }

        $largePath = public_path('uploads/products/large');
        $smallPath = public_path('uploads/products/small');

        File::ensureDirectoryExists($largePath);
        File::ensureDirectoryExists($smallPath);

        foreach ($gallery as $key => $tempImageId) {
            $tempImage = TempImage::find($tempImageId);
            if (!$tempImage) {
                continue;
            }

            $sourceFile = public_path('uploads/temp/' . $tempImage->name);
            if (!File::exists($sourceFile)) {
                continue;
            }

            $ext = pathinfo($tempImage->name, PATHINFO_EXTENSION);
            $newImageName = $product->id . '-' . time() . '-' . uniqid() . '.' . $ext;

            // Generate large image (1200 max)
            try {
                $manager = new ImageManager(new Driver());
                $imgLarge = $manager->decodePath($sourceFile);
                $imgLarge->scaleDown(1200);
                $imgLarge->save($largePath . '/' . $newImageName);
            } catch (\Throwable $e) {
                File::copy($sourceFile, $largePath . '/' . $newImageName);
            }

            // Generate small image (400x460 cover)
            try {
                $manager = new ImageManager(new Driver());
                $imgSmall = $manager->decodePath($sourceFile);
                $imgSmall->coverDown(400, 460);
                $imgSmall->save($smallPath . '/' . $newImageName);
            } catch (\Throwable $e) {
                File::copy($sourceFile, $smallPath . '/' . $newImageName);
            }

            // Save ProductImage record
            $productImage = new ProductImage();
            $productImage->image = $newImageName;
            $productImage->product_id = $product->id;
            $productImage->save();

            // Set first image as primary product image if not set yet
            if (empty($product->image) || $key === 0) {
                $product->image = $newImageName;
                $product->save();
            }
        }
    }
}
