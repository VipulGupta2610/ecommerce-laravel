<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(){
    $products=Products::orderBy('created_at','DESC')->get();
    return response()->json([
        'status'=>200,
        'products'=>$products
    ]);

    }
    public function store(Request $request){
        $validator = Validator:: make($request->all(), [
'title' => 'required',
'price' => 'required|numeric',
'category' => 'required|integer',
'sku' => 'required|unique:products,sku',
'is_featured'=>'required',
'status' => 'required',
]);
if ($validator->fails()){
    return response()->json([
        'status'=>400,
        'errors'=>$validator->errors()
    ],400);
}

    $product = new Product();
$product->title = $request->title;
$product->price = $request->price;
$product->compare_price = $request->compare_price;
$product->category_id = $request->category_id;
$product->brand_id = $request->brand_id;
$product->sku = $request->sku;
$product->skut = $request->sku;
$product->description = $request->description;
$product->short_description = $request->short_description;
$product->status = $request->status;
$product->is_featured = $request->is_featured;
$product->save();

return response()->json([
    'status'=>200,
    'message'=>'Product has been created successfully'
]);

}
public function show(){}
public function update($id , Request $request){
        $product = Product::find($id);

        if ($product==null){
            return response()->json([
                'status'=>400,
                'message'=>'Product not found'
            ],400);
        }

          $validator = Validator:: make($request->all(), [
'title' => 'required',
'price' => 'required|numeric',
'category' => 'required|integer',
'sku' => 'required|unique:products,sku',$id.',id',
'is_featured'=>'required',
'status' => 'required',
]);
if ($validator->fails()){
    return response()->json([
        'status'=>400,
        'errors'=>$validator->errors()
    ],400);
}

$product->title = $request->title;
$product->price = $request->price;
$product->compare_price = $request->compare_price;
$product->category_id = $request->category_id;
$product->brand_id = $request->brand_id;
$product->sku = $request->sku;
$product->skut = $request->sku;
$product->description = $request->description;
$product->short_description = $request->short_description;
$product->status = $request->status;
$product->is_featured = $request->is_featured;
$product->save();

return response()->json([
    'status'=>200,
    'message'=>'Product has been updated successfully'
]);
    }
    public function destroy($id){
        $product=Product::find($id);
        if ($product==null){
            return response()->json([
                'status'=>404,
                'message'=>'Product not found'
            ],404);
        }
        $product->delete();
        return response()->json([
            'status'=>200,
            'message'=>'Product has been deleted successfully'
        ],200);
    }

}
