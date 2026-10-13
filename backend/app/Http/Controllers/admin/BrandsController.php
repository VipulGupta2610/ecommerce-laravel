<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BrandsController extends Controller
{
    // Return all brands
    public function index(Request $request)
    {
        $query = Brand::withCount('products')->orderBy('name', 'ASC');

        if ($request->has('status') && $request->status !== null && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $brands = $query->get();

        return response()->json([
            'status' => 200,
            'data' => $brands,
        ], 200);
    }

    // Store a brand
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

        $brand = new Brand();
        $brand->name = $request->name;
        $brand->status = $request->has('status') ? (int) $request->status : 1;
        $brand->save();

        return response()->json([
            'status' => 201,
            'message' => 'Brand added successfully',
            'data' => $brand,
        ], 201);
    }

    // Return single brand
    public function show($id)
    {
        $brand = Brand::withCount('products')->find($id);

        if ($brand === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Brand not found',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $brand,
        ], 200);
    }

    // Update single brand
    public function update($id, Request $request)
    {
        $brand = Brand::find($id);

        if ($brand === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Brand not found',
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

        $brand->name = $request->name;
        if ($request->has('status')) {
            $brand->status = (int) $request->status;
        }
        $brand->save();

        return response()->json([
            'status' => 200,
            'message' => 'Brand updated successfully',
            'data' => $brand,
        ], 200);
    }

    // Destroy single brand
    public function destroy($id)
    {
        $brand = Brand::find($id);

        if ($brand === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Brand not found',
            ], 404);
        }

        $brand->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Brand deleted successfully',
        ], 200);
    }
}
