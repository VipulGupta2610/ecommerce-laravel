<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    // Return categories
    public function index(Request $request)
    {
        $query = Category::withCount('products')->orderBy('name', 'ASC');

        // Optional filter for active only
        if ($request->has('status') && $request->status !== null && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $categories = $query->get();

        return response()->json([
            'status' => 200,
            'data' => $categories,
        ], 200);
    }

    // Store a new category
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $category = new Category();
        $category->name = $request->name;
        $category->status = $request->has('status') ? (int) $request->status : 1;
        $category->save();

        return response()->json([
            'status' => 201,
            'message' => 'Category added successfully',
            'data' => $category,
        ], 201);
    }

    // Return single category
    public function show($id)
    {
        $category = Category::withCount('products')->find($id);

        if ($category === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $category,
        ], 200);
    }

    // Update category
    public function update($id, Request $request)
    {
        $category = Category::find($id);

        if ($category === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
                'data' => null,
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $category->name = $request->name;
        if ($request->has('status')) {
            $category->status = (int) $request->status;
        }
        $category->save();

        return response()->json([
            'status' => 200,
            'message' => 'Category updated successfully',
            'data' => $category,
        ], 200);
    }

    // Destroy category
    public function destroy($id)
    {
        $category = Category::find($id);

        if ($category === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
            ], 404);
        }

        $category->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Category deleted successfully',
        ], 200);
    }
}
