<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SizeController extends Controller
{
    // Return all sizes
    public function index()
    {
        $sizes = Size::orderBy('id', 'ASC')->get();

        return response()->json([
            'status' => 200,
            'data' => $sizes,
        ], 200);
    }

    // Store a size
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:sizes,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $size = Size::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'status' => 201,
            'message' => 'Size added successfully',
            'data' => $size,
        ], 201);
    }

    // Delete size
    public function destroy($id)
    {
        $size = Size::find($id);

        if ($size === null) {
            return response()->json([
                'status' => 404,
                'message' => 'Size not found',
            ], 404);
        }

        $size->delete();

        return response()->json([
            'status' => 200,
            'message' => 'Size deleted successfully',
        ], 200);
    }
}
