<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Fascades\Validator;

class BrandsController extends Controller
{
    // this method will return all brands 
        public function index()
    {
        $brands = Brand::orderBy('created_at', 'DESC')->get();

        return response()->json([
            'status' => 200,
            'data' => $brands,
        ]);
    }

    // this method will store a brand in db
    public function store(Request $request)
    {
        $validator = Validate::make($request->all(), [
            'name' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
            $brand = new Brand();
            $brand->name = $request->name;
            $brand->status = $request->status;
            $brand->save();

            return response()->json([
                'status' => 200,
                'message' => 'Brand added successfully',
                'data' => $brand,
            ], 200);
        }
    }

    // this method will return brand category
    public function show($id)
    {
        $brand = Brand::find($id);

        if ($category == null) {
            return response()->json([
                'status' => 404,
                'message' => 'Brand not found',
                'data' => [],
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $brand,
        ]);
    }

    // this method will update single brand
    public function update($id, Request $request)
    {

        $brand = Brand::find($id);

        if ($brand == null) {
            return response()->json([
                'status' => 404,
                'message' => 'Brand not found',
                'data' => [],
            ], 404);
        }

        $validator = Validate::make($request->all(), [
            'name' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
            $brand->name = $request->name;
            $brand->status = $request->status;
            $brand->save();

            return response()->json([
                'status' => 200,
                'message' => 'Brand added successfully',
                'data' => $brand,
            ], 200);
        }
    }

    // this method will destroy single brand
    public function destroy($id) {
    $brand = Brand::find($id);
    if ($category==null){
        return response()->json([
            'status'=>404,
            'message'=>'Brand not found',
            'data'=>[]
        ],404);
        }
        $brand->delete();
             return response()->json([
                'status' => 200,
                'message' => 'Brand deleted successfully'
            ], 200);
    }
}
