<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\TempImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class TempImageController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $image = $request->file('image');
        $ext = $image->getClientOriginalExtension() ?: $image->extension();
        $imageName = time() . '-' . uniqid() . '.' . $ext;

        $tempPath = public_path('uploads/temp');
        $thumbPath = public_path('uploads/temp/thumb');

        File::ensureDirectoryExists($tempPath);
        File::ensureDirectoryExists($thumbPath);

        // Move original image to temp directory
        $image->move($tempPath, $imageName);

        $tempImage = new TempImage();
        $tempImage->name = $imageName;
        $tempImage->save();

        // Generate thumbnail
        try {
            $manager = new ImageManager(new Driver());
            $img = $manager->decodePath($tempPath . '/' . $imageName);
            $img->coverDown(400, 450);
            $img->save($thumbPath . '/' . $imageName);
        } catch (\Throwable $e) {
            // Fallback: copy file to thumb if intervention has issues with certain driver
            File::copy($tempPath . '/' . $imageName, $thumbPath . '/' . $imageName);
        }

        return response()->json([
            'status' => 200,
            'message' => 'Image uploaded successfully',
            'data' => $tempImage,
        ], 200);
    }
}
